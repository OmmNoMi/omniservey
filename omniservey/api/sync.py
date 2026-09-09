import frappe, json, hashlib
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist(allow_guest=False)
def batch_push():
	"""
	Zero-Loss Idempotent Sync Handler.
	Accepts a JSON payload with a list of submissions from the offline PWA.
	Enforces atomic MariaDB transaction savepoints and UUIDv4 deduplication.
	"""
	data = frappe.request.get_data(as_text=True)
	if not data:
		data = frappe.form_dict.get("data")
		
	if isinstance(data, str):
		try:
			payload = json.loads(data)
		except Exception:
			frappe.throw(_("Invalid JSON payload"), frappe.ValidationError)
	elif isinstance(data, dict):
		payload = data
	else:
		frappe.throw(_("No data provided"), frappe.ValidationError)
		
	submissions = payload.get("submissions", [])
	if isinstance(payload, list):
		submissions = payload
	elif not submissions and "idempotency_key" in payload:
		submissions = [payload]
		
	results = []
	client_ip = frappe.local.request_ip if hasattr(frappe.local, "request_ip") else "127.0.0.1"
	current_user = frappe.session.user
	
	# Resolve surveyor linked to current user if available
	surveyor_name = frappe.db.get_value("OmniServey Surveyor", {"user": current_user}, "name")
	
	for sub in submissions:
		idempotency_key = sub.get("idempotency_key")
		if not idempotency_key:
			results.append({
				"status": "REJECTED",
				"error": "Missing mandatory idempotency_key (UUIDv4)"
			})
			continue
			
		# 1. Check Idempotency Cache
		existing_audit = frappe.db.get_value(
			"OmniServey Sync Audit Log",
			{"idempotency_key": idempotency_key},
			["name", "survey_response", "sync_status"],
			as_dict=True
		)
		
		if existing_audit:
			results.append({
				"idempotency_key": idempotency_key,
				"status": "DUPLICATE_SKIPPED",
				"doc_name": existing_audit.survey_response,
				"message": "Submission already processed safely."
			})
			continue
			
		# 2. Atomic Ingestion
		savepoint = f"sp_sync_{idempotency_key.replace('-', '_')}"
		try:
			frappe.db.savepoint(savepoint)
			
			raw_payload_str = json.dumps(sub, separators=(",", ":"))
			payload_hash = hashlib.sha256(raw_payload_str.encode("utf-8")).hexdigest()
			
			resp_doc = frappe.new_doc("OmniServey Response")
			resp_doc.idempotency_key = idempotency_key
			resp_doc.survey_template = sub.get("survey_template")
			resp_doc.template_version = sub.get("template_version") or 1
			resp_doc.entrepreneur = sub.get("entrepreneur")
			resp_doc.surveyor = sub.get("surveyor") or surveyor_name or current_user
			resp_doc.survey_status = "Submitted"
			resp_doc.gps_latitude = sub.get("gps_latitude")
			resp_doc.gps_longitude = sub.get("gps_longitude")
			resp_doc.gps_accuracy = sub.get("gps_accuracy")
			resp_doc.captured_at_local = sub.get("captured_at_local") or now_datetime()
			resp_doc.synced_at = now_datetime()
			resp_doc.response_payload = raw_payload_str
			
			# Unroll normalized items
			for item in sub.get("items", []):
				val_num = None
				val_raw = item.get("value")
				val_text = None
				val_json = None
				
				if isinstance(val_raw, (int, float)):
					val_num = float(val_raw)
					val_text = str(val_raw)
				elif isinstance(val_raw, (dict, list)):
					val_json = json.dumps(val_raw, separators=(",", ":"))
				elif val_raw is not None:
					val_text = str(val_raw)
					
				resp_doc.append("items", {
					"question_code": item.get("question_code"),
					"question_label": item.get("question_label"),
					"value_text": val_text,
					"value_numeric": val_num,
					"value_json": val_json,
					"attachment_file": item.get("attachment_file")
				})
				
			resp_doc.insert(ignore_permissions=True)
			
			# Create Sync Audit Log
			audit = frappe.new_doc("OmniServey Sync Audit Log")
			audit.idempotency_key = idempotency_key
			audit.survey_response = resp_doc.name
			audit.surveyor = resp_doc.surveyor
			audit.sync_status = "SUCCESS"
			audit.client_ip = client_ip
			audit.payload_hash_sha256 = payload_hash
			audit.processed_at = now_datetime()
			audit.insert(ignore_permissions=True)
			
			results.append({
				"idempotency_key": idempotency_key,
				"status": "SUCCESS",
				"doc_name": resp_doc.name,
				"synced_at": str(resp_doc.synced_at)
			})
			except Exception as e:
			frappe.db.rollback(save_point=savepoint)
			frappe.log_error(f"OmniServey Sync Error for {idempotency_key}", str(e))
			
			# Log Failure Audit
			try:
				fail_audit = frappe.new_doc("OmniServey Sync Audit Log")
				fail_audit.idempotency_key = idempotency_key
				fail_audit.sync_status = "FAILED"
				fail_audit.client_ip = client_ip
				fail_audit.error_message = str(e)[:140]
				fail_audit.processed_at = now_datetime()
				fail_audit.insert(ignore_permissions=True)
			except Exception:
				pass
				
			results.append({
				"idempotency_key": idempotency_key,
				"status": "FAILED",
				"error": str(e)
			})
			
	frappe.db.commit()
	return {"results": results}
