import { useTheme } from "@/hooks/useTheme";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { ImageStyle, ScrollView, TextStyle, ViewStyle } from "react-native";
import Markdown from "react-native-markdown-display";

interface MarkdownMessageProps {
  content: string;
  scrollEnabled?: boolean;
}

type MarkdownStyles = {
  [key: string]: TextStyle | ViewStyle | ImageStyle;
};

const MarkdownMessage = ({
  content,
  scrollEnabled = false,
}: MarkdownMessageProps) => {
  const { theme } = useTheme();

  const markdownStyle: MarkdownStyles = {
    body: {
      color: theme.text,
      fontSize: 16,
      lineHeight: 24, // more breathing space
      marginBottom: 12,
      userSelect: "text",
    },
    heading1: {
      color: theme.text,
      fontSize: 26,
      fontWeight: "700",
      marginVertical: 12,
      lineHeight: 34,
    },
    heading2: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "700",
      marginVertical: 10,
    },
    heading3: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "700",
      marginVertical: 8,
    },
    heading4: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "700",
      marginVertical: 6,
    },
    heading5: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
      marginVertical: 4,
    },
    heading6: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
      marginVertical: 2,
    },
    code_inline: {
      backgroundColor: theme.background + "80", // semi-transparent for contrast
      color: theme.accent,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    code_block: {
      backgroundColor: theme.background,
      color: theme.accent,
      padding: 12,
      borderRadius: 12,
      marginVertical: 12,
    },
    fence: {
      borderWidth: 0,
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 12,
      marginVertical: 12,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: theme.accent,
      paddingLeft: 16,
      paddingVertical: 6,
      marginVertical: 12,
      backgroundColor: theme.background + "50", // subtle highlight
      color: theme.text,
      fontStyle: "italic",
      borderRadius: 6,
    },
    list_item: {
      color: theme.text,
      marginVertical: 4,
    },
    table: {
      borderWidth: 1,
      borderColor: theme.background,
      marginVertical: 12,
      borderRadius: 6,
      overflow: "hidden",
    },
    th: {
      backgroundColor: theme.background,
      color: theme.text,
      fontWeight: "700",
      paddingVertical: 6,
      paddingHorizontal: 8,
      textAlign: "center",
    },
    td: {
      backgroundColor: theme.card + "80", // soft background for cells
      color: theme.text,
      paddingVertical: 6,
      paddingHorizontal: 8,
      textAlign: "center",
    },
    link: {
      color: theme.accent,
      textDecorationLine: "underline",
    },
    image: {
      borderRadius: 12,
      overflow: "hidden",
    },
    hr: {
      marginVertical: 12,
    },
  };

  const handleLinkPress = (url: string) => {
    // Opens inside the app as a Chrome Custom Tab (Android) or Safari View Controller (iOS)
    WebBrowser.openBrowserAsync(url).catch(console.error);
    return false; // tells Markdown we handled it
  };

  // Wrap in ScrollView optionally for long content
  const Container = scrollEnabled ? ScrollView : React.Fragment;

  return (
    <Container>
      <Markdown style={markdownStyle} onLinkPress={handleLinkPress}>
        {content}
      </Markdown>
    </Container>
  );
};

export default MarkdownMessage;
