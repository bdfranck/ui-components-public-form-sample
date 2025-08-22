import { GoabFormState, requiredValidator } from "@abgov/ui-components-common";
import { useState } from "react";
import {
  GoabCheckbox,
  GoabFieldset,
  GoabFormItem,
  GoabPublicForm,
  GoabPublicFormPage,
  GoabText,
  GoabCallout,
  GoabPublicFormSummary,
  usePublicFormController,
} from "@abgov/react-components";
import { UploadIdentityFile } from "./UploadIdentityFile";
import { startViewTransition } from "./viewTransitions";

type Page = "2C.1" | "2C.Review";

interface Section2CProps {
  onComplete?: (state: GoabFormState) => void;
}

export const Section2C = ({onComplete}: Section2CProps) => {

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Main form controller for Section2C pages
  const {
    init,
    continueTo,
    validate,
    controller: mainFormController,
  } = usePublicFormController<Page>("details");

  const onInit = (event: Event) => {
    init(event);
  }

  const onCompleteSection2C = (e: GoabFormState) => {
    console.log("Complete section2C", e);
    onComplete?.(e);
  }

  const onContinue = (e: Event, from: Page) => {
    console.log("onContinue", e, from);
    if ((e as CustomEvent).detail?.cancelled) return;

    let nextPage: Page | undefined;

    switch (from) {
      case "2C.1":
        nextPage = validate2C1(e);
        break;
      default:
        break;
    }

    if (nextPage) {
      startViewTransition(() => continueTo(nextPage));
    }
  }

  // Handle file upload callback
  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file.name);
    setUploadedFile(file);
  };

  const validate2C1 = (e: Event): Page | undefined => {
    // Check if file has been uploaded
    if (!uploadedFile) {
      console.error("Please upload your government issued ID.");
      return undefined;
    }

    const [isConfirmOk] = validate(e, "confirmation", [
      requiredValidator("Please confirm the accuracy of your information."),
      (value: unknown) => {
      console.log("value is ", value);
        if (value !== "yes") {
          return "You must check the box to confirm the accuracy of your information.";
        }
        return "";
      }
    ]);

    if (!isConfirmOk) return undefined;

    // Continue to review page
    return "2C.Review";
  }

  return (
    <GoabPublicForm name={"section2c-form"} onComplete={onCompleteSection2C} onInit={onInit}>
      <GoabPublicFormPage
        id="2C.1"
        heading="Verify your identity"
        buttonText="Save and continue"
        onContinue={(e) => onContinue(e, "2C.1")}
      >
        <GoabText mb="l">
          Velit nisl etiam nec fames eu hendrerit mauris. Amet ut lobortis augue gravida
          pharetra id vel vestibulum quam. Blandit nullam sit lacus nunc habitasse cras.
          Mattis ut id egestas ipsum volutpat et leo faucibus. Risus a tortor euismod lorem.
        </GoabText>

        <UploadIdentityFile onUpload={handleFileUpload}/>

        <GoabFieldset>
          <GoabFormItem name="Confirmation" mt="xl">
            <GoabCheckbox
              name="confirmation"
              value={"yes"}
              text="By submitting these documents, I confirm that all information provided is true and accurate to the best of my knowledge"
            />
          </GoabFormItem>
        </GoabFieldset>
      </GoabPublicFormPage>

      <GoabPublicFormPage
        id="2C.Review"
        type="summary"
        heading="Review your answers"
      >
        <GoabPublicFormSummary />
      </GoabPublicFormPage>
    </GoabPublicForm>
  );
}
