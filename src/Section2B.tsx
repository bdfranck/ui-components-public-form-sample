import { GoabFormState, requiredValidator } from "@abgov/ui-components-common";
import { useState } from "react";
import {
  GoabButton,
  GoabFieldset,
  GoabFormItem,
  GoabInput,
  GoabPublicForm,
  GoabPublicFormPage,
  GoabPublicFormSummary,
  GoabPublicSubform,
  GoabPublicSubformIndex,
  GoabRadioGroup,
  GoabRadioItem,
  GoabTable,
  GoabText,
  GoabTextarea,
  usePublicFormController,
} from "@abgov/react-components";

type Page = "2B.1" | "2B.2" | "2B.3" | "2B.4" | "2B.5" | "2B.Review";
type DependentPage = "dependent-name" | "2B.3.Review";


interface Section2BProps {
  onComplete?: (state: GoabFormState) => void;
}
export const Section2B = ({onComplete}: Section2BProps) => {

  // Main form controller for Section2B pages
  const {
    init,
    continueTo,
    validate,
    controller: mainFormController,
  } = usePublicFormController<Page>("details");

  // Dependents list controller (separate controller for subform)
  const {
    initList: initDependentsList,
    getStateList: getChildStateList,
    controller: childFormController,
    state: dependentsState,
  } = usePublicFormController<DependentPage>("list");

  // State to track the dependents list
  const [dependentsList, setDependentsList] = useState<Record<string, string>[]>([]);
  const onInit = (event: Event) => {
    init(event);
    // Let the web component handle its own initialization
    // Manual initState interferes with the Svelte form's automatic state creation
  }

  // Main form state change handler (to ensure proper state updates including headings)
  const onMainFormStateChange = (state: GoabFormState) => {
    console.log("Main form state change:", state);
    // Force React state update to ensure the controller state is synchronized
    if (mainFormController.state) {
      console.log("Main controller state after change:", mainFormController.state);
    }
  }
  const onCompleteSection2B = (e: GoabFormState) => {
    console.log("Complete section2B", e);
    onComplete?.(e);
  }
  const onContinue = (e: Event, from: Page) => {
    console.log("onContinue", e, from);
    if ((e as CustomEvent).detail?.cancelled) return;

    let nextPage: Page | undefined;

    switch (from) {
      case "2B.1":
        nextPage = validate2B1(e);
        break;
      case "2B.2":
        nextPage = validate2B2(e);
        break;
      case "2B.3":
        nextPage = validate2B3(e);
        break;
      case "2B.4":
        nextPage = validate2B4(e);
        break;
      case "2B.5":
        nextPage = validate2B5(e);
        break;
      default:
        break;
    }

    if (nextPage) {
      if (document.startViewTransition) {
        document.startViewTransition(() => continueTo(nextPage));
      }
      else {
        console.warn("View transitions not supported, navigating directly");
        continueTo(nextPage);
      }      
    }
  }

  const validate2B1 = (e: Event): Page | undefined => {
    const [isRequiredOk] = validate(e, "household-people", [requiredValidator("Please enter the number of people in your household.")]);
    if (!isRequiredOk) return undefined;

    return "2B.2";
  }

  const validate2B2 = (e: Event): Page | undefined => {
    const [isRequiredOk, dependentsValue] = validate(e, "dependents", [requiredValidator("Please select an option.")]);
    if (!isRequiredOk) return undefined;

    if (dependentsValue === "yes") {
      return "2B.3";
    } else {
      // If "No", go to review page
      return "2B.Review";
    }
  }

  const validate2B3 = (e: Event): Page | undefined => {
    // For multistep pages with subforms, the event detail structure is different
    // The validation is handled by the subform itself (via buttonVisibility)
    console.log("validate2B3", e);

    // Check if we have at least one dependent
    const currentDependents = childFormController.getStateList();
    if (currentDependents.length === 0) {
      // This shouldn't happen since the continue button is hidden when no dependents
      console.warn("No dependents added");
      return undefined;
    }

    // Continue to the next page
    return "2B.4";
  }

  const validate2B4 = (e: Event): Page | undefined => {
    const [isRequiredOk, healthValue] = validate(e, "dependents-health", [requiredValidator("Please select an option.")]);
    if (!isRequiredOk) return undefined;

    if (healthValue === "yes") {
      return "2B.5";
    } else {
      // If "No", go to review page
      return "2B.Review";
    }
  }

  const validate2B5 = (e: Event): Page | undefined => {
    const [isRequiredOk] = validate(e, "health-details", [requiredValidator("Please provide details about health conditions or accommodations.")]);
    if (!isRequiredOk) return undefined;

    // After entering health details, go to review page
    return "2B.Review";
  }

  // Subform event handlers (following Angular pattern)
  const onSubformInit = (e: Event) => {
    console.log("Subform init:", e);
    initDependentsList(e);
  }

  const onSubformStateChange = (e: Event) => {
    console.log("Subform state change:", e);
    childFormController.updateListState(e);
    setDependentsList([...getChildStateList()]);
  }

  // Dependent list management
  const handleEditDependent = (index: number) => {
    childFormController.edit(index);
  }

  const handleDeleteDependent = (index: number) => {
    childFormController.remove(index);
  }

  // Subform validation
  const onDependentContinue = (e: Event, from: DependentPage) => {
    if ((e as CustomEvent).detail?.cancelled) return;

    switch (from) {
      case "dependent-name":
        const [isValid] = childFormController.validate(e, "fullName", [
          requiredValidator("Please enter the dependent's full name.")
        ]);
        if (isValid) {
          childFormController.continueTo("2B.3.Review");
        }
        break;
    }
  }

  // Subform management (standard pattern)
  // The subform will handle add/edit/remove operations automatically
  // through the web component's built-in functionality

  return (
    <GoabPublicForm name={"section2b-form"} onComplete={onCompleteSection2B} onInit={onInit} onStateChange={onMainFormStateChange}>
      <GoabPublicFormPage
        id="2B.1"
        heading="How many people currently live in your household?"
        buttonText="Save and continue"
        onContinue={(e) => onContinue(e, "2B.1")}
      >
        <GoabFieldset>
          <GoabFormItem name="How many people currently live in your household?">
            <GoabInput name="household-people" trailingContent="People"/>
          </GoabFormItem>
        </GoabFieldset>
      </GoabPublicFormPage>

      <GoabPublicFormPage
        id="2B.2"
        heading="Do you have any dependents under the age of 18?"
        buttonText="Save and continue"
        onContinue={(e) => onContinue(e, "2B.2")}
      >
        <GoabFieldset>
          <GoabFormItem name="Do you have any dependents under the age of 18?">
            <GoabRadioGroup name="dependents">
              <GoabRadioItem value="yes" label={"Yes"}></GoabRadioItem>
              <GoabRadioItem value="no" label={"No"}></GoabRadioItem>
            </GoabRadioGroup>
          </GoabFormItem>
        </GoabFieldset>
      </GoabPublicFormPage>

      <GoabPublicFormPage
        id="2B.3"
        type={"multistep"}
        onContinue={(e) => onContinue(e, "2B.3")}
      >
        <GoabPublicSubform
          id="2B.3"
          name="2B.3"
          summaryHeading="Dependants under 18"
          onInit={onSubformInit}
          onStateChange={onSubformStateChange}
        >
          <GoabPublicSubformIndex
            heading="Add dependants under the age of 18"
            actionButtonText="Add another dependant"
            buttonVisibility={dependentsList.length > 0 ? "visible" : "hidden"}
          >
            <GoabText mb="l">
              Please provide information about any dependents under the age of 18 for whom you are responsible. Dependents include your biological or adopted children, stepchildren, and any other minors in your care. This information is necessary to determine eligibility for various benefits and services provided by the government. Ensure that you enter accurate details for each dependent, as this will help us process your application more efficiently and provide you with the appropriate support.
            </GoabText>

            {dependentsList.length > 0 && (
              <GoabTable width="100%" mb="xl">
                <thead>
                  <tr>
                    <th>Full name</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dependentsList.map((item, index) => (
                    <tr key={index}>
                      <td>{item["fullName"]}</td>
                      <td className="goa-table-number-header">
                        <GoabButton onClick={() => handleEditDependent(index)}>
                          Edit
                        </GoabButton>
                      </td>
                      <td className="goa-table-number-header" style={{width: "0px"}}>
                        <GoabButton onClick={() => handleDeleteDependent(index)}>
                          Remove
                        </GoabButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </GoabTable>
            )}

          </GoabPublicSubformIndex>

          <GoabPublicFormPage
            id="dependent-name"
            sectionTitle="Dependent's profile"
            heading="Dependent information"
            buttonText="Continue"
            onContinue={(e) => onDependentContinue(e, "dependent-name")}
          >
            <GoabFieldset>
              <GoabFormItem label="Full name">
                <GoabInput name="fullName" />
              </GoabFormItem>
            </GoabFieldset>
          </GoabPublicFormPage>

          <GoabPublicFormPage
            id="2B.3.Review"
            heading="Review dependent information"
            type="summary"
            buttonText="Back to list"
          >
            <GoabPublicFormSummary />
          </GoabPublicFormPage>
        </GoabPublicSubform>
      </GoabPublicFormPage>

      <GoabPublicFormPage
        id="2B.4"
        heading="Do any dependants have long-term health conditions or disabilities?"
        buttonText="Save and continue"
        onContinue={(e) => onContinue(e, "2B.4")}
      >
        <GoabFieldset>
          <GoabFormItem name="Do any dependants have long-term health conditions or disabilities?">
            <GoabRadioGroup name="dependents-health">
              <GoabRadioItem value="yes" label="Yes" />
              <GoabRadioItem value="no" label="No" />
            </GoabRadioGroup>
          </GoabFormItem>
        </GoabFieldset>
      </GoabPublicFormPage>

      <GoabPublicFormPage
        id="2B.5"
        heading="Please provide details to help us understand any specific needs or accommodations."
        buttonText="Save and continue"
        onContinue={(e) => onContinue(e, "2B.5")}
      >
        <GoabFieldset>
          <GoabFormItem name="Please provide details to help us understand any specific needs or accommodations.">
            <GoabTextarea
              name="health-details"
              maxCount={100}
              placeholder="Enter details about health conditions or accommodations needed..."
            />
          </GoabFormItem>
        </GoabFieldset>
      </GoabPublicFormPage>

      <GoabPublicFormPage
        id="2B.Review"
        type="summary"
        heading="Review your information"
        buttonText="Review and Submit"
      >
        <GoabPublicFormSummary />
      </GoabPublicFormPage>
    </GoabPublicForm>);
}
