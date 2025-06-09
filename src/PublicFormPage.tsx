import {
    GoabFormState,
} from "@abgov/ui-components-common";
import React, {useState} from "react";
import {TaskListPage} from "./TaskListPage";
import {Section1A} from "./Section1A";
import {Section1B} from "./Section1B";
import {Section2A} from "./Section2A";

type Section = "section1a" | "tasklist" | "section1b" | "section2a" | "section2b" | "section2c";

export const PublicFormPage = () => {
    const [currentSection, setCurrentSection] = useState<Section>("section1a");
    const [completedSections, setCompletedSections] = useState<string[]>([]);
    const [sectionData, setSectionData] = useState<Record<string, GoabFormState>>({});

    const handleSectionComplete = (sectionId: string, formState: GoabFormState) => {
        console.log(`${sectionId} completed:`, formState);
        
        // Save the form data
        setSectionData(prev => ({
            ...prev,
            [sectionId]: formState
        }));
        
        // Mark section as completed
        setCompletedSections(prev => [...prev, sectionId]);
        
        // Navigate to next section or task list
        if (sectionId === "section1a") {
            setCurrentSection("tasklist");
        } else if (sectionId === "section1b") {
            setCurrentSection("tasklist"); // Return to task list to show progress
        } else if (sectionId === "section2a") {
            setCurrentSection("tasklist"); // Return to task list to show progress
        }
        // Add more navigation logic as needed
    };

    const handleNavigateToSection = (sectionId: Section) => {
        setCurrentSection(sectionId);
    };

    return (
        <>
            {currentSection === "section1a" && (
                <Section1A onComplete={(state) => handleSectionComplete("section1a", state)} />
            )}
            
            {currentSection === "tasklist" && (
                <TaskListPage 
                    completedSections={completedSections}
                    onNavigateToSection={handleNavigateToSection}
                />
            )}
            
            {currentSection === "section1b" && (
                <Section1B onComplete={(state) => handleSectionComplete("section1b", state)} />
            )}
            
            {currentSection === "section2a" && (
                <Section2A onComplete={(state) => handleSectionComplete("section2a", state)} />
            )}
            
            {/* Add other sections as needed */}
        </>
    );
};