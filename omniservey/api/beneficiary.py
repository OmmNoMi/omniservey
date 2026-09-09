import frappe, hashlib
from frappe import _

@frappe.whitelist(allow_guest=False)
def get_manifest(district=None, block=None):
	"""
	Returns a compact JSON trie / search index for offline beneficiary lookup
	and duplicate registration prevention.
	"""
	filters = {}
	if district:
		filters["district"] = district
	if block:
		filters["block"] = block
		
	beneficiaries = frappe.get_all(
		"OmniServey Entrepreneur",
		filters=filters,
		fields=[
			"name",
			"entrepreneur_uid",
			"full_name",
			"phone_hash",
			"shg_name",
			"village",
			"block",
			"district",
			"enterprise_category",
			"enterprise_name"
		],
		limit=5000
	)
	return {
		"count": len(beneficiaries),
		"beneficiaries": beneficiaries
	}

@frappe.whitelist(allow_guest=False)
def register_beneficiary(payload):
	"""Registers a new beneficiary with automatic PII encryption & search hashing."""
	if isinstance(payload, str):
		payload = frappe.parse_json(payload)
		
	uid = payload.get("entrepreneur_uid")
	if not uid:
		frappe.throw(_("Beneficiary UID is mandatory"), frappe.ValidationError)
		
	doc = frappe.new_doc("OmniServey Entrepreneur")
	doc.entrepreneur_uid = uid
	doc.full_name = payload.get("full_name")
	doc.phone_number = payload.get("phone_number")
	doc.age = payload.get("age")
	doc.caste_category = payload.get("caste_category")
	doc.education_level = payload.get("education_level")
	doc.shg_name = payload.get("shg_name")
	doc.enterprise_name = payload.get("enterprise_name")
	doc.enterprise_category = payload.get("enterprise_category")
	doc.annual_turnover = payload.get("annual_turnover") or 0
	doc.employee_count = payload.get("employee_count") or 0
	doc.village = payload.get("village")
	doc.block = payload.get("block")
	doc.district = payload.get("district")
	doc.state = payload.get("state") or "Himachal Pradesh"
	doc.gps_latitude = payload.get("gps_latitude")
	doc.gps_longitude = payload.get("gps_longitude")
	doc.upi_id = payload.get("upi_id")
	
	if payload.get("aadhaar"):
		doc.aadhaar_encrypted = payload.get("aadhaar")
	if payload.get("bank_account"):
		doc.bank_account_encrypted = payload.get("bank_account")
		
	doc.insert(ignore_permissions=True)
	frappe.db.commit()
	
	return {
		"name": doc.name,
		"entrepreneur_uid": doc.entrepreneur_uid,
		"phone_hash": doc.phone_hash
	}
