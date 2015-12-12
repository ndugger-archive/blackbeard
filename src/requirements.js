export const testRequirements = async (requirements) => {

	if (!requirements) return true;

	if (!Array.isArray(requirements)) requirements = [requirements];

	let requirementsMet = true;
	for (let requirement of requirements) {
		requirementsMet = await requirement(request, response);
		if (!requirementsMet) break;
	}

	return requirementsMet;
}

export default (rules = []) => {

	if (!Array.isArray(rules)) rules = [rules];

	return (controller, action, descriptor) => {
		if (action) {
			descriptor.value.requirements = rules;
			return descriptor;
		}
		else {
			return controller;
		}
	}
}