import frappe, json
from frappe import _

def user_has_template_permission(template, user=None):
	"""
	Strict RBAC & Access Control for Survey Templates.
	Rules:
	1. Administrator and System Manager have unconditional access.
	2. If is_public is true (1), all users (including Guest) can access.
	3. If user is Guest and not public -> Denied.
	4. If allowed_users is specified, user must be in the comma-separated list.
	5. If allowed_roles is specified, user must possess at least one of the roles.
	6. If neither is specified, fallback to standard Frappe document permission check.
	"""
	if not user:
		user = frappe.session.user

	user_roles = set(frappe.get_roles(user))
	if "System Manager" in user_roles or "Administrator" in user_roles or user == "Administrator":
		return True

	if isinstance(template, str):
		template = frappe.db.get_value(
			"OmniServey Template",
			template,
			["name", "is_public", "allowed_roles", "allowed_users"],
			as_dict=True
		)
		if not template:
			return False

	is_public = getattr(template, "is_public", 0)
	if is_public:
		return True

	if user == "Guest":
		return False

	allowed_users_raw = getattr(template, "allowed_users", None) or ""
	if allowed_users_raw:
		allowed_users = [u.strip().lower() for u in allowed_users_raw.split(",") if u.strip()]
		if user.lower() in allowed_users:
			return True

	allowed_roles_raw = getattr(template, "allowed_roles", None) or ""
	if allowed_roles_raw:
		allowed_roles = [r.strip() for r in allowed_roles_raw.split(",") if r.strip()]
		if any(role in user_roles for role in allowed_roles):
			return True

	# If neither allowed_roles nor allowed_users are specified, check DocPerm
	if not allowed_roles_raw and not allowed_users_raw:
		tmpl_name = getattr(template, "name", None)
		if tmpl_name:
			return frappe.has_permission("OmniServey Template", "read", doc=tmpl_name, user=user)
		return False

	return False

def get_template_permission_query_conditions(user=None):
	"""Hook for Desk list view & Frappe ORM query filtering."""
	if not user:
		user = frappe.session.user

	user_roles = set(frappe.get_roles(user))
	if "System Manager" in user_roles or "Administrator" in user_roles or user == "Administrator":
		return ""

	conditions = ["`tabOmniServey Template`.is_public = 1"]

	if user != "Guest":
		escaped_user = frappe.db.escape(f"%{user}%")
		conditions.append(f"`tabOmniServey Template`.allowed_users LIKE {escaped_user}")

		for role in user_roles:
			escaped_role = frappe.db.escape(f"%{role}%")
			conditions.append(f"`tabOmniServey Template`.allowed_roles LIKE {escaped_role}")

	return "(" + " OR ".join(conditions) + ")"

def has_template_doc_permission(doc, ptype="read", user=None):
	"""Hook for Frappe has_permission check."""
	return user_has_template_permission(doc, user)

@frappe.whitelist(allow_guest=True)
def get_current_user_info():
	"""Returns authenticated session user profile and active roles for PWA authorization."""
	user = frappe.session.user
	roles = frappe.get_roles(user)
	return {
		"user": user,
		"is_guest": user == "Guest",
		"roles": roles,
		"full_name": frappe.utils.get_fullname(user) if user != "Guest" else "Guest Surveyor"
	}

@frappe.whitelist(allow_guest=True)
def list_active_templates(project=None):
	"""Returns all published survey templates accessible to current user according to RBAC."""
	filters = {"status": "Published"}
	if project:
		filters["project"] = project

	templates = frappe.get_all(
		"OmniServey Template",
		filters=filters,
		fields=[
			"name", "title", "project", "version", "target_category",
			"is_public", "allowed_roles", "allowed_users",
			"schema_hash_sha256", "published_at"
		],
		order_by="published_at desc"
	)

	current_user = frappe.session.user
	# Strictly filter out templates if current user lacks permission
	authorized_templates = [t for t in templates if user_has_template_permission(t, current_user)]
	return authorized_templates

@frappe.whitelist(allow_guest=True)
def get_schema(template_name, version=None):
	"""Fetches compiled JSON schema after verifying user permission."""
	if not template_name:
		frappe.throw(_("Template name is mandatory"), frappe.ValidationError)

	current_user = frappe.session.user
	if not user_has_template_permission(template_name, current_user):
		frappe.throw(
			_("You do not have permission to access survey template '{0}'").format(template_name),
			frappe.PermissionError
		)

	template = frappe.get_doc("OmniServey Template", template_name)

	if not template.compiled_schema_json:
		template.save(ignore_permissions=True)

	return {
		"template_name": template.name,
		"title": template.title,
		"project": template.project,
		"version": template.version,
		"status": template.status,
		"schema_hash_sha256": template.schema_hash_sha256,
		"schema": json.loads(template.compiled_schema_json) if template.compiled_schema_json else {}
	}

@frappe.whitelist(allow_guest=True)
def get_translations(template_name=None, language_code="hi"):
	"""Returns the vernacular dictionary map using Frappe's native Translation DocType."""
	translations = frappe.get_all(
		"Translation",
		filters={"language": language_code},
		fields=["source_text", "translated_text", "context"],
		limit=1000
	)
	dict_map = {t.source_text: t.translated_text for t in translations}

	if template_name:
		for t in translations:
			if t.context == template_name:
				dict_map[t.source_text] = t.translated_text

	return {
		"survey_template": template_name,
		"language_code": language_code,
		"translations": dict_map
	}

@frappe.whitelist(allow_guest=True)
def get_available_languages():
	"""Returns all enabled languages in Frappe sorted with prominent Indian vernaculars first."""
	try:
		langs = frappe.get_all(
			"Language",
			filters={"enabled": 1},
			fields=["language_code", "language_name"],
			order_by="language_name asc"
		)
	except Exception:
		langs = frappe.get_all(
			"Language",
			fields=["language_code", "language_name"],
			order_by="language_name asc"
		)

	# Priority sort for high-relevance languages
	priority_codes = ["en", "hi", "mr", "gu", "pa", "bn", "ta", "te", "kn", "ml", "ur", "ar", "fr", "es"]
	sorted_langs = []
	seen = set()

	for code in priority_codes:
		match = next((l for l in langs if l.language_code == code), None)
		if match:
			sorted_langs.append({"code": match.language_code, "label": match.language_name})
			seen.add(match.language_code)

	for l in langs:
		if l.language_code not in seen:
			sorted_langs.append({"code": l.language_code, "label": l.language_name})

	return sorted_langs

@frappe.whitelist(allow_guest=True)
def get_service_worker():
	"""Serves the Service Worker script with Service-Worker-Allowed root scope header."""
	import os
	sw_path = os.path.join(frappe.get_app_path("omniservey"), "public", "pwa", "sw.js")
	try:
		with open(sw_path, "r", encoding="utf-8") as f:
			content = f.read()
	except Exception:
		content = "// OmniServey Service Worker"

	frappe.response["type"] = "binary"
	frappe.response["filecontent"] = content.encode("utf-8")
	frappe.response["filename"] = "sw.js"
	frappe.response["content_type"] = "application/javascript; charset=utf-8"
	frappe.response["headers"] = {
		"Service-Worker-Allowed": "/",
		"Cache-Control": "no-cache, no-store, must-revalidate"
	}




