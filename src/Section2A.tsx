import {
  GoabBlock,
  GoabCheckbox,
  GoabDropdown,
  GoabDropdownItem,
  GoabFieldset,
  GoabFormItem,
  GoabInput,
  GoabPublicForm,
  GoabPublicFormPage,
  GoabPublicFormSummary,
  GoabRadioGroup,
  GoabRadioItem,
  usePublicFormController,
} from "@abgov/react-components";
import { GoabFormState, requiredValidator } from "@abgov/ui-components-common";

type Page = "2A.1"
  | "2A.2"
  | "2A.3"
  | "2A.3.a"
  | "2A.Review";

interface Section2AProps {
  onComplete?: (state: GoabFormState) => void;
}
export const Section2A = ({onComplete}: Section2AProps) => {
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
  const onCompleteSection2A = (e: GoabFormState) => {
    console.log("Complete section2A", e);
    onComplete?.(e);
  }

  const onContinue = (e: Event, from: Page) => {
    console.log("onContinue", e, from);
    if ((e as CustomEvent).detail?.cancelled) return;

    let nextPage: Page | undefined;

    switch (from) {
      case "2A.1":
        nextPage = validate2A1(e);
        break;
      case "2A.2":
        nextPage = validate2A2(e);
        break;
      case "2A.3":
        nextPage = validate2A3(e);
        break;
      case "2A.3.a":
        nextPage = validate2A3a(e);
        break;
      default:
        break;
    }
    if (nextPage) {
      continueTo(nextPage);
    }
  }

  const validate2A1 = (e: Event): Page | undefined => {
    const [isRequiredOk] = validate(e, "name", [requiredValidator("Please enter your name.")]);
    if (!isRequiredOk) return undefined;

    return "2A.2";
  }

  const validate2A2 = (e: Event): Page | undefined => {
    // Validate all required fields
    const validations = [
      validate(e, "street-address", [requiredValidator("Please enter your street address.")]),
      validate(e, "city", [requiredValidator("Please enter your city or town.")]),
      validate(e, "province", [requiredValidator("Please select your province or territory.")]),
      validate(e, "postal-code", [requiredValidator("Please enter your postal code.")])
    ];

    // Check if all validations passed
    const allValid = validations.every(([isValid]) => isValid);
    if (!allValid) return undefined;

    // Suite is optional, no validation needed
    return "2A.3";
  }

  const validate2A3 = (e: Event): Page | undefined => {
    const [isValid] = validate(e, "contact-feedback", [requiredValidator("Please tell us if we can contact you for feedback.")]);
    if (!isValid) return undefined;

    const contactFeedback = (e as CustomEvent).detail?.state?.["contact-feedback"];
    if (contactFeedback?.value === "Yes") {
      return "2A.3.a";
    }
    if (contactFeedback?.value === "No") {
      return "2A.Review";
    }

    return undefined;
  }

  const validate2A3a = (e: Event): Page | undefined => {
    // Contact methods are optional, so we can proceed directly to review
    console.log("validate2A3a", e);
    // const state = {
    //   "contact-phone": {
    //     "name": "contact-phone",
    //     "value": "phone",
    //     "label": "",
    //     "order": 1
    //   },
    //   "contact-email": {
    //     "name": "contact-email",
    //     "value": "email",
    //     "label": "",
    //     "order": 2
    //   },
    //   "contact-text": {
    //     "name": "contact-text",
    //     "value": "text",
    //     "label": "",
    //     "order": 3
    //   },
    //   "phone-number": {
    //     "name": "phone-number",
    //     "value": "1234567",
    //     "label": "",
    //     "order": 4
    //   },
    //   "email-address": {
    //     "name": "email-address",
    //     "value": "thytran142@hotmail.com",
    //     "label": "",
    //     "order": 5
    //   },
    //   "mobile-phone-number": {
    //     "name": "mobile-phone-number",
    //     "value": "1234567890",
    //     "label": "",
    //     "order": 6
    //   }
    // }
    return "2A.Review";
  }


  return (
    <GoabPublicForm name={"section1a-form"} onComplete={onCompleteSection2A} onInit={onInit}>
          <GoabPublicFormPage
            id="2A.1"
            heading="What is your name?"
            buttonText="Save and continue"
            onContinue={(e) => onContinue(e, "2A.1")}
          >
            <GoabFieldset>
              <GoabFormItem name="Name">
                <GoabInput name="name"/>
              </GoabFormItem>
            </GoabFieldset>
          </GoabPublicFormPage>

          <GoabPublicFormPage
            id="2A.2"
            heading="What is your current home address?"
            buttonText="Save and continue"
            onContinue={(e) => onContinue(e, "2A.2")}
          >
            <GoabFieldset>
              <GoabFormItem name="Street address" label="Street address">
                <GoabInput name="street-address" />
              </GoabFormItem>
              <GoabFormItem name="Suite or unit #" label="Suite or unit #" requirement={"optional"}>
                <GoabInput name="suite" />
              </GoabFormItem>
              <GoabFormItem name="City or town" label="City or town">
                <GoabInput name="city" />
              </GoabFormItem>
              <GoabBlock direction="row" gap="xl">
                <GoabFormItem name="Province or territory" label="Province or territory">
                  <GoabDropdown name="province" placeholder="Select">
                    <GoabDropdownItem value="AB" label="Alberta" />
                    <GoabDropdownItem value="BC" label="British Columbia" />
                    <GoabDropdownItem value="MB" label="Manitoba" />
                    <GoabDropdownItem value="NB" label="New Brunswick" />
                    <GoabDropdownItem value="NL" label="Newfoundland and Labrador" />
                    <GoabDropdownItem value="NT" label="Northwest Territories" />
                    <GoabDropdownItem value="NS" label="Nova Scotia" />
                    <GoabDropdownItem value="NU" label="Nunavut" />
                    <GoabDropdownItem value="ON" label="Ontario" />
                    <GoabDropdownItem value="PE" label="Prince Edward Island" />
                    <GoabDropdownItem value="QC" label="Quebec" />
                    <GoabDropdownItem value="SK" label="Saskatchewan" />
                    <GoabDropdownItem value="YT" label="Yukon" />
                  </GoabDropdown>
                </GoabFormItem>
                <GoabFormItem name="Postal code" label="Postal code">
                  <GoabInput name="postal-code" />
                </GoabFormItem>
              </GoabBlock>
            </GoabFieldset>
          </GoabPublicFormPage>

          <GoabPublicFormPage
            id="2A.3"
            heading="Can we contact you in the future for feedback on our services?"
            buttonText="Save and continue"
            onContinue={(e) => onContinue(e, "2A.3")}
          >
            <GoabFieldset>
              <GoabFormItem name="Contact for feedback">
                <GoabRadioGroup name="contact-feedback" id="contact-feedback">
                  <GoabRadioItem value="Yes" label="Yes"/>
                  <GoabRadioItem value="No" label="No" />
                </GoabRadioGroup>
              </GoabFormItem>
            </GoabFieldset>
          </GoabPublicFormPage>

          <GoabPublicFormPage
            id="2A.3.a"
            heading="How would you like to be contacted?"
            buttonText="Save and continue"
            onContinue={(e) => onContinue(e, "2A.3.a")}
          >
            <GoabFieldset>
              <GoabFormItem name="Contact method">
                <GoabCheckbox
                  name="contact-phone"
                  value={"phone"}
                  text="Phone"
                  reveal={
                    <GoabFormItem name="Phone number" label={"What is your phone number? "}>
                      <GoabInput name="phone-number"/>
                    </GoabFormItem>
                  }
                />
                <GoabCheckbox
                  name="contact-email"
                  value={"email"}
                  text="Email"
                  reveal={
                    <GoabFormItem name="Email address">
                      <GoabInput name="email-address" type="email" />
                    </GoabFormItem>
                  }
                />
                <GoabCheckbox
                  value={"text"}
                  name="contact-text"
                  text="Text message"
                  reveal={
                    <GoabFormItem name="Mobile phone number">
                      <GoabInput name="mobile-phone-number" />
                    </GoabFormItem>
                  }
                />
              </GoabFormItem>
            </GoabFieldset>
          </GoabPublicFormPage>

          <GoabPublicFormPage id="2A.Review" type="summary" heading="Review your answers">
            <GoabPublicFormSummary/>
          </GoabPublicFormPage>
    </GoabPublicForm>

  )
}
