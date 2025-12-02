import { useState } from "react";

const useStep = () => {
	const [currentStep, setCurrentStep] = useState(1);
	const goToStep = (step: number) => {
		const currentStepElement = document.getElementById(`step-${currentStep}`);
		const nextStepElement = document.getElementById(`step-${step}`);
		if (currentStepElement && nextStepElement) {
			currentStepElement.classList.add("hidden");
			nextStepElement.classList.remove("hidden");
			setCurrentStep(step);
		}
	};
	return { currentStep, goToStep, setCurrentStep };
};

export default useStep;
