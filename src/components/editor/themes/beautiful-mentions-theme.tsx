import "./beautiful-mentions-theme.css"
import { BeautifulMentionsTheme } from "lexical-beautiful-mentions";

export const beautifulMentionsTheme: BeautifulMentionsTheme = {
  "@": "mention", // Default mention styling
  "@Focused": "mention-focused", // Focused mention styling
  "due:": {
    trigger: "mention-trigger", // Styling for the "due:" trigger
    value: "mention-value", // Styling for the value after the trigger
    container: "mention-container", // Container styling
    containerFocused: "mention-container-focused", // Focused container styling
  },
};