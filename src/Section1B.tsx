import {
  GoabCheckbox,
  GoabFieldset,
  GoabFormItem,
  GoabPublicForm,
  GoabPublicFormPage,
  GoabPublicFormSummary,
  GoabText,
  usePublicFormController,
} from "@abgov/react-components";
import { GoabFormState, requiredValidator } from "@abgov/ui-components-common";
import React from "react";
import { startViewTransition } from "./viewTransitions";

type Page = "terms-of-use" | "1B.Review";

interface Section1BProps {
  onComplete?: (state: GoabFormState) => void;
  onBack?: () => void;
}

export const Section1B = ({ onComplete, onBack }: Section1BProps) => {
  const {
    init,
    initState,
    continueTo,
    validate,
  } = usePublicFormController<Page>("details");

  const onInit = (event: Event) => {
    init(event);
    setTimeout(() => {
      initState({
        uuid: crypto.randomUUID(),
        form: {},
        history: [],
        editting: "",
        status: "not-started"
      });
    }, 0)
  }

  const onContinue = (e: Event, from: Page) => {
    if ((e as CustomEvent).detail?.cancelled) return;

    let nextPage: Page | undefined;

    switch (from) {
      case "terms-of-use":
        nextPage = validateTermsOfUse(e);
        break;
      default:
        break;
    }
    if (nextPage) {
      startViewTransition(() => continueTo(nextPage));
    }
  }

  const validateTermsOfUse = (e: Event): Page|undefined => {
    const [isValid] = validate(e, "terms-of-use", [
      requiredValidator("You must accept the terms of use."),
      (value: unknown) => {
        if (value !== "Yes") {
          return "You must accept the terms of use.";
        }
        return "";
      }
    ]);
    if (!isValid) return undefined;

    return "1B.Review";
  }

  const onCompleteSection1B = (e: GoabFormState) => {
    console.log("Complete section1B", e);
    onComplete?.(e);
  }

  return (
    <GoabPublicForm name="section1b-form" onComplete={onCompleteSection1B} onInit={onInit}>
      <GoabPublicFormPage
        id="terms-of-use"
        heading="Terms of use"
        first={true}
        buttonText={"Continue to next section"}
        onContinue={(e) => onContinue(e, "terms-of-use")}
        onBack={onBack}>

        <GoabText tag="p" size="body-m" color="secondary" mt="l">
          Donec malesuada sagittis fringilla pulvinar in molestie. Sagittis felis congue
          pellentesque tristique urna in habitasse. At faucibus commodo pellentesque enim
          nisl at. Fermentum quisque viverra diam amet consequat tellus. Amet interdum sit
          elementum nibh at justo.
        </GoabText>

        <GoabFieldset mt="xl">
          <GoabFormItem name="Terms of use">
            <GoabCheckbox
              id="terms-of-use"
              name="terms-of-use"
              text="I accept the terms of use."
              value="Yes"
            />
          </GoabFormItem>
        </GoabFieldset>
      </GoabPublicFormPage>

      <GoabPublicFormPage id={"1B.Review"} type={"summary"} heading={"Review your answers"}>
        <GoabPublicFormSummary />
      </GoabPublicFormPage>
    </GoabPublicForm>
  );
};
