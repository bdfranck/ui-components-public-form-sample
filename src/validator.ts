import {FieldValidator} from "@abgov/ui-components-common";

export const dateOfBirthValidator = (): FieldValidator => {
    return (value: unknown) => {
        if (!value || typeof value !== "string") return "Enter a complete date of birth.";

        // Check for incomplete date pattern (0000-01-01, 0000-12-31, etc.)
        const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
        const match = value.match(datePattern);

        if (!match) return "Enter a complete date of birth.";

        const [, year, month, day] = match;

        // Check if any part is all zeros or incomplete
        if (year === "0000" && month === "00" && day === "00") {
            return "Enter a complete date of birth.";
        }

        // Check for invalid year
        if (year === "0000") {
            return "Enter a valid year.";
        }

        // Check for invalid day
        if (day === "00") {
            return "Enter a valid day.";
        }

        // Additional validation for valid date
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);

        // Check year range
        if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
            return "Enter a valid year.";
        }

        // Check month range
        if (monthNum < 1 || monthNum > 12) {
            return "Enter a complete date of birth.";
        }

        // Check day range based on month
        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
        if (dayNum < 1 || dayNum > daysInMonth) {
            return "Enter a valid day.";
        }

        // Check if it's a valid date
        const date = new Date(yearNum, monthNum - 1, dayNum);
        if (date.getFullYear() !== yearNum ||
            date.getMonth() !== monthNum - 1 ||
            date.getDate() !== dayNum) {
            return "Enter a valid day.";
        }

        // Check if date is in the future
        if (date > new Date()) {
            return "Enter a date of birth in the past.";
        }

        return "";
    };
};
