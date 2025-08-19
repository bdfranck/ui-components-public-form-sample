import React, {useState} from "react";
import {
  GoabButton,
  GoabCallout,
  GoabLink,
  GoabPublicFormTask,
  GoabPublicFormTaskList,
  GoabTable,
  GoabText,
} from "@abgov/react-components";
import { GoabFormState} from "@abgov/ui-components-common";
import { Section1A } from "./Section1A";
import { Section1B } from "./Section1B";
import { Section2A } from "./Section2A";
import { Section2B } from "./Section2B";
import { Section2C } from "./Section2C";

type CurrentView =
  | { type: "task"; taskId: string }
  | { type: "tasklist" }
  | { type: "completion" };

type TaskStatus = "completed" | "not-started" | "cannot-start";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  state?: GoabFormState | null;
}

interface TaskSection {
  id: string;
  heading: string;
  tasks: Task[];
}

export const SimplePublicFormExample = () => {
  const [currentView, setCurrentView] = useState<CurrentView>({ type: "task", taskId: "section1a" });


  const [taskSections, setTaskSections] = useState<TaskSection[]>([
    {
      id: "before-you-start",
      heading: "1. Before you start",
      tasks: [
        {
          id: "section1a",
          title: "Eligibility questions",
          status: "not-started",
          state: null
        },
        {
          id: "section1b",
          title: "Read terms of use",
          status: "cannot-start",
          state: null
        }
      ]
    },
    {
      id: "prepare-application",
      heading: "2. Prepare application",
      tasks: [
        {
          id: "section2a",
          title: "Your contact details",
          status: "cannot-start",
          state: null
        },
        {
          id: "section2b",
          title: "Your family",
          status: "cannot-start",
          state: null
        },
        {
          id: "section2c",
          title: "Verify your identity",
          status: "cannot-start",
          state: null
        }
      ]
    },
    {
      id: "schedule-service",
      heading: "3. Schedule service",
      tasks: [
        {
          id: "email-confirmation",
          title: "Receive email confirmation",
          status: "cannot-start",
          state: null
        },
        {
          id: "choose-date",
          title: "Choose date",
          status: "cannot-start",
          state: null
        },
        {
          id: "pay-fee",
          title: "Pay service fee",
          status: "cannot-start",
          state: null
        }
      ]
    }
  ]);

  const navigateTo = (taskId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (document.startViewTransition) {
      document.startViewTransition(() => setCurrentView({ type: "task", taskId }));
    }
    else {
      console.warn("View transitions not supported, navigating directly");
      setCurrentView({ type: "task", taskId });
    } 
  }

  const onSection1BComplete = () => {
    setTaskSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        tasks: section.tasks.map(task =>
          task.id === "section1b"
            ? { ...task, status: "completed" as TaskStatus }
            : task.id === "section2a" || task.id === "section2b" || task.id === "section2c"
            ? { ...task, status: "not-started" as TaskStatus } // Enable all section 2 tasks
            : task
        )
      }))
    );

    if (document.startViewTransition) {
        document.startViewTransition(() => setCurrentView({ type: "tasklist" }));
    }
    else {
        console.warn("View transitions not supported, navigating directly");
        setCurrentView({ type: "tasklist" });
    }
  }

  // Helper function to handle section 2 completions
  const handleSection2Complete = (taskId: string, state: GoabFormState) => {
    setTaskSections(prevSections => {
      const updatedSections = prevSections.map(section => ({
        ...section,
        tasks: section.tasks.map(task =>
          task.id === taskId
            ? { ...task, status: "completed" as TaskStatus, state }
            : task
        )
      }));

      // Check if 2 out of 3 tasks in prepare-application are completed after this update
      if (checkIfShowCompletion(updatedSections)) {
        if (document.startViewTransition) {
          document.startViewTransition(() => setCurrentView({ type: "completion" }));
        } else {
          console.warn("View transitions not supported, navigating directly");
          setCurrentView({ type: "completion" });
        }
      } else {
        if (document.startViewTransition) {
          document.startViewTransition(() => setCurrentView({ type: "tasklist" }));
        } else {
          console.warn("View transitions not supported, navigating directly");
          setCurrentView({ type: "tasklist" });
        }
      }

      return updatedSections;
    });
  }


  const onSection1BBack = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setCurrentView({ type: "tasklist" }));
    } else {
      console.warn("View transitions not supported, navigating directly");
      setCurrentView({ type: "tasklist" });
    }
  }

  // Check if 2 out of 3 tasks in "Prepare application" section are completed
  const checkIfShowCompletion = (sections: TaskSection[]) => {
    const prepareApplicationSection = sections.find(s => s.id === "prepare-application");
    if (!prepareApplicationSection) return false;

    const completedTasks = prepareApplicationSection.tasks.filter(task => task.status === "completed");
    return completedTasks.length === 3;
  }

  const onSection1AComplete = (state: GoabFormState) => {
    console.log("Section1A completed with state:", state);

    // Update the task status and state for section1a
    setTaskSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        tasks: section.tasks.map(task =>
          task.id === "section1a"
            ? { ...task, status: "completed" as TaskStatus, state }
            : task.id === "section1b"
            ? { ...task, status: "not-started" as TaskStatus } // Enable next task
            : task
        )
      }))
    );

    // Switch to task list view
    if (document.startViewTransition) {
      document.startViewTransition(() => setCurrentView({ type: "tasklist" }));
    } else {
      console.warn("View transitions not supported, navigating directly");
      setCurrentView({ type: "tasklist" });
    }
  }

  // Calculate progress for the callout message
  const getProgressInfo = () => {
    const totalSections = taskSections.length;
    // A section is only completed when ALL tasks in that section are completed
    const completedSections = taskSections.filter(section =>
      section.tasks.every(task => task.status === "completed")
    ).length;

    if (completedSections === totalSections - 1) { // The last one only when confirmed
      // All sections completed
      return {
        type: "important" as const,
        heading: "Waiting for your application to be confirmed",
        content: "You will receive an email notification when your application has been approved and is ready to continue."
      };
    } else if (completedSections === 0) {
      // No sections completed yet
      return {
        type: "information" as const,
        heading: `You have ${totalSections} sections to complete`,
        content: <GoabLink><a href="#" onClick={navigateTo("section1b")}>Start terms of use</a></GoabLink>
      };
    } else {
      // Some sections completed
      return {
        type: "important" as const,
        heading: "Application incomplete",
        content: `You have completed ${completedSections} of ${totalSections} sections.`
      };
    }
  }

  return (
    <>
      {currentView.type === "task" && currentView.taskId === "section1a" && (
        <Section1A onComplete={onSection1AComplete} />
      )}

      {currentView.type === "task" && currentView.taskId === "section1b" && (
        <Section1B onComplete={onSection1BComplete} onBack={onSection1BBack} />
      )}

      {currentView.type === "task" && currentView.taskId === "section2a" && (
        <Section2A onComplete={(state) => handleSection2Complete("section2a", state)} />
      )}

      {currentView.type === "task" && currentView.taskId === "section2b" && (
        <Section2B onComplete={(state) => handleSection2Complete("section2b", state)} />
      )}

      {currentView.type === "task" && currentView.taskId === "section2c" && (
        <Section2C onComplete={(state) => handleSection2Complete("section2c", state)} />
      )}

      {currentView.type === "tasklist" && (
        <div>
          <GoabText tag="h1" size="heading-xl">Apply for a service (demo)</GoabText>

          {(() => {
            const progressInfo = getProgressInfo();
            return (
              <GoabCallout
                type={progressInfo.type}
                size="medium"
                heading={progressInfo.heading}
                mb="2xl"
                mt="xl"
              >
                {progressInfo.content}
              </GoabCallout>
            );
          })()}

          {taskSections.map(section => (
            <div key={section.id}>
              <GoabPublicFormTaskList heading={section.heading}>
                <GoabTable width="100%" mb="2xl" mt="l">
                  <tbody>
                    {section.tasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <GoabPublicFormTask status={task.status}>
                            {task.status === "not-started" ? (
                              <GoabLink><a href="#" onClick={navigateTo(task.id)}>{task.title}</a></GoabLink>
                            ) : (
                              task.title
                            )}
                          </GoabPublicFormTask>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </GoabTable>
              </GoabPublicFormTaskList>
            </div>
          ))}
        </div>
      )}

      {currentView.type === "completion" && (
        <div>
          <GoabText tag="h1" size="heading-xl">You have completed the first part of the application</GoabText>

          <GoabCallout type="success" heading="Application submitted for review" mb="xl" mt="xl">
            <GoabText mb="s">
              You will receive a copy of the initial application to your email name@email.com.
            </GoabText>
            <GoabText mb="0">
              Your reference number is: <strong>1234ABC</strong>
            </GoabText>
          </GoabCallout>

          <GoabText tag="h2" mb="s">What happens next</GoabText>
          <GoabText mb="s">
            Your application is being reviewed. You will be contacted by email to schedule your service within 24 hours.
          </GoabText>
          <GoabText mb="l">
            You can now close this window. You will receive a link back to the application overview by email.
          </GoabText>

          <GoabText mb="s">What did you think of this service? <GoabLink><a href="#">Give feedback</a></GoabLink></GoabText>

          <GoabText tag="h2" mb="s" mt="xl">If you have questions about your application</GoabText>
          <GoabText mb="s">Contact the [ministry area].</GoabText>
          <GoabText mb="s">Email: <GoabLink><a href="mailto:information@gov.ab.ca">information@gov.ab.ca</a></GoabLink></GoabText>
          <GoabText mb="xl">Phone: <GoabLink><a href="tel:7801234567">780 123 4567</a></GoabLink></GoabText>

          <GoabButton type="tertiary" onClick={() => setCurrentView({ type: "tasklist" })}>
            Back to application overview
          </GoabButton>
        </div>
      )}

      {/*    /!* Section 1B Pages *!/*/}
      {/*    <GoabPublicFormPage*/}
      {/*      id="terms-of-use"*/}
      {/*      heading="Terms of use"*/}
      {/*      buttonText="Continue to next section"*/}
      {/*      onContinue={(e) => onContinue(e, "terms-of-use")}*/}
      {/*    >*/}
      {/*      <GoabText tag="p" size="body-m" color="secondary">*/}
      {/*        Donec malesuada sagittis fringilla pulvinar in molestie. Sagittis felis congue pellentesque tristique urna in habitasse. At faucibus commodo pellentesque enim nisl at. Fermentum quisque viverra diam amet consequat tellus. Amet interdum sit elementum nibh at justo.*/}
      {/*      </GoabText>*/}
      {/*      <GoabFieldset>*/}
      {/*        <GoabFormItem name="Terms of use">*/}
      {/*          <GoabCheckbox name="terms-of-use" value={"Yes"} text="I accept the terms of use." />*/}
      {/*        </GoabFormItem>*/}
      {/*      </GoabFieldset>*/}
      {/*    </GoabPublicFormPage>*/}

      {/*    <GoabPublicFormPage*/}
      {/*      id="section1b-summary"*/}
      {/*      type="multistep"*/}
      {/*      heading="Apply for a service (Demo)"*/}
      {/*    >*/}
      {/*      <div className="warning">*/}
      {/*        <GoabCallout type="information" size="medium" heading="Application incomplete" mb="2xl" mt="xl">*/}
      {/*          You have completed 1 of 3 sections.*/}
      {/*        </GoabCallout>*/}
      {/*      </div>*/}
      {/*      <GoabText tag="h2">*/}
      {/*        1. Before you start*/}
      {/*      </GoabText>*/}
      {/*      <GoabTable width="100%" mb="2xl" mt="l">*/}
      {/*        <tbody>*/}
      {/*        <tr>*/}
      {/*          <td>*/}
      {/*            <GoabText tag="span" size={"body-m"}>Eligibility questions</GoabText>*/}
      {/*          </td>*/}
      {/*          <td className="goa-table-number-column">*/}
      {/*            <GoabBadge type="success" content="Completed" ariaLabel="completed"></GoabBadge>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        <tr>*/}
      {/*          <td>*/}
      {/*            <GoabText tag="span" size={"body-m"}>Read terms of use</GoabText>*/}
      {/*          </td>*/}
      {/*          <td className="goa-table-number-column">*/}
      {/*            <GoabBadge type="success" content="Completed" ariaLabel="completed"></GoabBadge>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        </tbody>*/}
      {/*      </GoabTable>*/}
      {/*      <GoabText tag="h2">*/}
      {/*        2. Prepare application*/}
      {/*      </GoabText>*/}
      {/*      <GoabTable width="100%" mb="2xl" mt="l">*/}
      {/*        <tbody>*/}
      {/*        <tr>*/}
      {/*          <td>*/}
      {/*            <GoabLink><a href="#" onClick={handleContactDetailsClick}>Your contact details</a></GoabLink>*/}
      {/*          </td>*/}
      {/*          <td className="goa-table-number-column">*/}
      {/*            <GoabText tag="span" size="body-m" color="secondary"> Not started</GoabText>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        <tr>*/}
      {/*          <td>*/}
      {/*            <GoabLink><a href="#" onClick={handleFamilyClick}>Your family</a></GoabLink>*/}
      {/*          </td>*/}
      {/*          <td className="goa-table-number-column">*/}
      {/*            <GoabText tag="span" size="body-m" color="secondary"> Not started</GoabText>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        <tr>*/}
      {/*          <td>*/}
      {/*            <GoabLink><a href="#" onClick={handleIdentityClick}>Verify your identity</a></GoabLink>*/}
      {/*          </td>*/}
      {/*          <td className="goa-table-number-column">*/}
      {/*            <GoabText tag="span" size="body-m" color="secondary"> Not started</GoabText>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        </tbody>*/}
      {/*      </GoabTable>*/}

      {/*      <GoabText tag="h2">*/}
      {/*        3. Schedule service*/}
      {/*      </GoabText>*/}
      {/*      <GoabText tag="p" size="body-s" color="secondary">*/}
      {/*        You need to complete the previous section before you can start this task.*/}
      {/*      </GoabText>*/}
      {/*      <GoabTable width="100%" mt="l" mb="3xl">*/}
      {/*        <tbody>*/}
      {/*        <tr>*/}
      {/*          <td> <GoabText tag={"span"} size={"body-m"}>*/}
      {/*            Receive email confirmation</GoabText>*/}
      {/*          </td>*/}
      {/*          <td className="goa-table-number-column">*/}
      {/*            <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        <tr>*/}
      {/*          <td> <GoabText tag={"span"} size={"body-m"}>*/}
      {/*            Choose date</GoabText>*/}
      {/*          </td>*/}
      {/*          <td className="goa-table-number-column">*/}
      {/*            <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        <tr>*/}
      {/*          <td><GoabText tag={"span"} size={"body-m"}>*/}
      {/*            Pay service fee</GoabText>*/}
      {/*          </td>*/}
      {/*          <td className="goa-table-number-column">*/}
      {/*            <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        </tbody>*/}
      {/*      </GoabTable>*/}
      {/*    </GoabPublicFormPage>*/}

      {/*    /!* Section 2A Pages *!/*/}
      {/*    <GoabPublicFormPage*/}
      {/*      id="2A.1"*/}
      {/*      heading="What is your name?"*/}
      {/*      buttonText="Save and continue"*/}
      {/*      onContinue={(e) => onContinue(e, "2A.1")}*/}
      {/*    >*/}
      {/*      <GoabFieldset>*/}
      {/*        <GoabFormItem name="Name">*/}
      {/*          <GoabInput name="name"/>*/}
      {/*        </GoabFormItem>*/}
      {/*      </GoabFieldset>*/}
      {/*    </GoabPublicFormPage>*/}

      {/*    <GoabPublicFormPage*/}
      {/*      id="2A.2"*/}
      {/*      heading="What is your current home address?"*/}
      {/*      buttonText="Save and continue"*/}
      {/*      onContinue={(e) => onContinue(e, "2A.2")}*/}
      {/*    >*/}
      {/*      <GoabFieldset>*/}
      {/*        <GoabFormItem name="Street address" label="Street address">*/}
      {/*          <GoabInput name="street-address" />*/}
      {/*        </GoabFormItem>*/}
      {/*        <GoabFormItem name="Suite or unit #" label="Suite or unit #" requirement={"optional"}>*/}
      {/*          <GoabInput name="suite" />*/}
      {/*        </GoabFormItem>*/}
      {/*        <GoabFormItem name="City or town" label="City or town">*/}
      {/*          <GoabInput name="city" />*/}
      {/*        </GoabFormItem>*/}
      {/*        <GoabBlock direction="row" gap="xl">*/}
      {/*          <GoabFormItem name="Province or territory" label="Province or territory">*/}
      {/*            <GoabDropdown name="province" placeholder="Select">*/}
      {/*              <GoabDropdownItem value="AB" label="Alberta" />*/}
      {/*              <GoabDropdownItem value="BC" label="British Columbia" />*/}
      {/*              <GoabDropdownItem value="MB" label="Manitoba" />*/}
      {/*              <GoabDropdownItem value="NB" label="New Brunswick" />*/}
      {/*              <GoabDropdownItem value="NL" label="Newfoundland and Labrador" />*/}
      {/*              <GoabDropdownItem value="NT" label="Northwest Territories" />*/}
      {/*              <GoabDropdownItem value="NS" label="Nova Scotia" />*/}
      {/*              <GoabDropdownItem value="NU" label="Nunavut" />*/}
      {/*              <GoabDropdownItem value="ON" label="Ontario" />*/}
      {/*              <GoabDropdownItem value="PE" label="Prince Edward Island" />*/}
      {/*              <GoabDropdownItem value="QC" label="Quebec" />*/}
      {/*              <GoabDropdownItem value="SK" label="Saskatchewan" />*/}
      {/*              <GoabDropdownItem value="YT" label="Yukon" />*/}
      {/*            </GoabDropdown>*/}
      {/*          </GoabFormItem>*/}
      {/*          <GoabFormItem name="Postal code" label="Postal code">*/}
      {/*            <GoabInput name="postal-code" />*/}
      {/*          </GoabFormItem>*/}
      {/*        </GoabBlock>*/}
      {/*      </GoabFieldset>*/}
      {/*    </GoabPublicFormPage>*/}

      {/*    <GoabPublicFormPage*/}
      {/*      id="2A.3"*/}
      {/*      heading="Can we contact you in the future for feedback on our services?"*/}
      {/*      buttonText="Save and continue"*/}
      {/*      onContinue={(e) => onContinue(e, "2A.3")}*/}
      {/*    >*/}
      {/*      <GoabFieldset>*/}
      {/*        <GoabFormItem name="Contact for feedback">*/}
      {/*          <GoabRadioGroup name="contact-feedback" id="contact-feedback">*/}
      {/*            <GoabRadioItem value="Yes" label="Yes"/>*/}
      {/*            <GoabRadioItem value="No" label="No" />*/}
      {/*          </GoabRadioGroup>*/}
      {/*        </GoabFormItem>*/}
      {/*      </GoabFieldset>*/}
      {/*    </GoabPublicFormPage>*/}

      {/*    <GoabPublicFormPage*/}
      {/*      id="2A.3.a"*/}
      {/*      heading="How would you like to be contacted?"*/}
      {/*      buttonText="Save and continue"*/}
      {/*      onContinue={(e) => onContinue(e, "2A.3.a")}*/}
      {/*    >*/}
      {/*      <GoabFieldset>*/}
      {/*        <GoabFormItem name={"Contact method"}>*/}
      {/*          <GoabCheckbox*/}
      {/*            name="contact-phone"*/}
      {/*            value={"phone"}*/}
      {/*            text="Phone"*/}
      {/*            reveal={*/}
      {/*              <GoabFormItem name="Phone number" label={"What is your phone number? "}>*/}
      {/*                <GoabInput name="phone-number"/>*/}
      {/*              </GoabFormItem>*/}
      {/*            }*/}
      {/*          />*/}
      {/*          <GoabCheckbox*/}
      {/*            name="contact-email"*/}
      {/*            value={"email"}*/}
      {/*            text="Email"*/}
      {/*            reveal={*/}
      {/*              <GoabFormItem name="Email address">*/}
      {/*                <GoabInput name="email-address" type="email" />*/}
      {/*              </GoabFormItem>*/}
      {/*            }*/}
      {/*          />*/}
      {/*          <GoabCheckbox*/}
      {/*            value={"text"}*/}
      {/*            name="contact-text"*/}
      {/*            text="Text message"*/}
      {/*            reveal={*/}
      {/*              <GoabFormItem name="Mobile phone number">*/}
      {/*                <GoabInput name="mobile-phone-number" />*/}
      {/*              </GoabFormItem>*/}
      {/*            }*/}
      {/*          />*/}
      {/*        </GoabFormItem>*/}
      {/*      </GoabFieldset>*/}
      {/*    </GoabPublicFormPage>*/}

      {/*    <GoabPublicFormPage*/}
      {/*      id="2A.Review"*/}
      {/*      type="multistep"*/}
      {/*      heading="Review your  answers"*/}
      {/*      buttonText="Confirm"*/}
      {/*      onContinue={(e) => onContinue(e, "2A.Review")}*/}
      {/*    >*/}
      {/*      <GoabPublicFormSummary/>*/}
      {/*    </GoabPublicFormPage>*/}
      {/*  </GoabPublicForm>*/}
      {/*)}*/}
    </>
  );
};
