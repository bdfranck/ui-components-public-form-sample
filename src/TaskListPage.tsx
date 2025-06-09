import {GoabBadge, GoabCallout, GoabLink, GoabTable, GoabText} from "@abgov/react-components";

type Section = "section1a" | "tasklist" | "section1b" | "section2a" | "section2b" | "section2c";

interface TaskListPageProps {
    completedSections: string[];
    onNavigateToSection: (sectionId: Section) => void;
}
export const TaskListPage = ({ completedSections, onNavigateToSection }: TaskListPageProps) => {
    return (
        <>
            <div className="warning">
                <GoabCallout type="information" size="medium" heading="You have 3 sections to complete" mb="2xl"
                             mt="xl">
                    <GoabLink><a href="#" onClick={(e) => { e.preventDefault(); onNavigateToSection("section1b"); }}>Start terms of use</a></GoabLink>
                </GoabCallout>
            </div>
            <GoabText tag="h2">
                1. Before you start
            </GoabText>
            <GoabTable width="100%" mb="2xl" mt="l">
                <tbody>
                <tr>
                    <td>
                        <GoabText tag="span" size={"body-m"}>Eligibility questions</GoabText>
                    </td>
                    <td className="goa-table-number-column">
                        <GoabBadge type="success" content="Completed" ariaLabel="completed"></GoabBadge>
                    </td>
                </tr>
                <tr>
                    <td>
                        <GoabLink><a href="#" onClick={(e) => { e.preventDefault(); onNavigateToSection("section1b"); }}>Read terms of use
                        </a></GoabLink>
                    </td>
                    <td className="goa-table-number-column">
                        <GoabBadge 
                            type={completedSections.includes("section1b") ? "success" : "information"} 
                            content={completedSections.includes("section1b") ? "Completed" : "Not started"} 
                            ariaLabel={completedSections.includes("section1b") ? "completed" : "not started"}
                        />
                    </td>
                </tr>
                </tbody>
            </GoabTable>
            <GoabText tag="h2">
                2. Prepare application
            </GoabText>
            <GoabText tag="p" size="body-s" color="secondary">
                You need to complete the previous section before you can start this task.
            </GoabText>
            <GoabTable width="100%" mb="2xl" mt="l">
                <tbody>
                <tr>
                    <td>
                        {completedSections.includes("section1b") ? (
                            <GoabLink><a href="#" onClick={(e) => { e.preventDefault(); onNavigateToSection("section2a"); }}>Your contact details</a></GoabLink>
                        ) : (
                            <GoabText tag="span" size={"body-m"}>Your contact details</GoabText>
                        )}
                    </td>
                    <td className="goa-table-number-column">
                        {completedSections.includes("section1b") ? (
                            <GoabBadge 
                                type={completedSections.includes("section2a") ? "success" : "information"} 
                                content={completedSections.includes("section2a") ? "Completed" : "Not started"} 
                                ariaLabel={completedSections.includes("section2a") ? "completed" : "not started"}
                            />
                        ) : (
                            <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>
                        <GoabText tag={"span"} size={"body-m"}>
                            Your family
                        </GoabText>
                    </td>
                    <td className="goa-table-number-column">
                        <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                    </td>
                </tr>
                <tr>
                    <td>
                        <GoabText tag={"span"} size={"body-m"}>
                            Verify your identity
                        </GoabText>
                    </td>
                    <td className="goa-table-number-column">
                        <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                    </td>
                </tr>
                </tbody>
            </GoabTable>

            <GoabText tag="h2">
                3. Schedule service
            </GoabText>
            <GoabText tag="p" size="body-s" color="secondary">
                You need to complete the previous section before you can start this task.
            </GoabText>
            <GoabTable width="100%" mt="l" mb="3xl">
                <tbody>
                <tr>
                    <td> <GoabText tag={"span"} size={"body-m"}>
                        Receive email confirmation</GoabText>
                    </td>
                    <td className="goa-table-number-column">
                        <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                    </td>
                </tr>
                <tr>
                    <td> <GoabText tag={"span"} size={"body-m"}>
                        Choose date</GoabText>
                    </td>
                    <td className="goa-table-number-column">
                        <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                    </td>
                </tr>
                <tr>
                    <td><GoabText tag={"span"} size={"body-m"}>
                        Pay service fee</GoabText>
                    </td>
                    <td className="goa-table-number-column">
                        <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                    </td>
                </tr>
                </tbody>
            </GoabTable>
        </>
    );
}
