import frappe, json
from frappe import _

@frappe.whitelist(allow_guest=False)
def list_active_templates(project=None):
	"""Returns all published survey templates accessible to field surveyors."""
	filters = {"status": "Published"}
	if project:
		filters["project"] = project
		
	templates = frappe.get_all(
		"OmniServey Template",
		filters=filters,
		fields=["name", "title", "project", "version", "target_category", "schema_hash_sha256", "published_at"],
		order_by="published_at desc"
	)
	return templates

@frappe.whitelist(allow_guest=False)
def get_schema(template_name, version=None):
	"""Fetches the compiled JSON schema and verification hash for offline caching."""
	if not template_name:
		frappe.throw(_("Template name is mandatory"), frappe.ValidationError)
		
	filters = {"name": template_name}
	if version:
		filters["version"] = version
		
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

@frappe.whitelist(allow_guest=False)
def get_translations(template_name, language_code="hi"):
	"""Returns the vernacular dictionary map for a specific survey template and language."""
	translations = frappe.get_all(
		"OmniServey Translation",
		filters={
			"survey_template": template_name,
			"language_code": language_code
		},
		fields=["question_code", "translated_label", "translated_options_json", "translated_help_text"]
	)
	
	dict_map = {}
	for t in translations:
		dict_map[t.question_code] = {
			"label": t.translated_label,
			"options": json.loads(t.translated_options_json) if t.translated_options_json else None,
			"help_text": t.translated_help_text
		}
	return {
		"survey_template": template_name,
		"language_code": language_code,
		"translations": dict_map
	}
