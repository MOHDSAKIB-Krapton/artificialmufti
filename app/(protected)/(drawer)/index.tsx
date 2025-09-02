import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const mockChat = [
  {
    id: 1,
    sender: "user",
    message: `Hey, can you explain AI? s by processing large volumes of data, recognizing patterns, and making predictions or decisions without being explicitly programmed for every scenario. There are two major types of AI:  
- **Narrow AI (Weak AI):** Focused on a single task, like voice assistants, chatbots, or recommendation systems.  
- **General AI (Strong AI):** Hypothetical AI with human-like reasoning abilities that can perform any intellectual task a human can.  

Real-world applications:  
- Self-driving cars  
- Healthcare (diagnosis, drug discovery)  
- Finance (fraud detection, algorithmic trading)  
- Personal assistants (like Siri, Alexa, or Google Assistant)  
- Language translation  
- Image and speech recognition  

The main challenge with AI is balancing innovation with ethics, ensuring transparency, reducing biases in algorithms, and building systems that are trustworthy and aligned with human values.  
`,
  },
  {
    id: 2,
    sender: "assistant",
    message: `Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think, reason, and learn like humans. It’s a broad field that includes multiple subfields like machine learning, natural language processing, robotics, and computer vision.  

AI works by processing large volumes of data, recognizing patterns, and making predictions or decisions without being explicitly programmed for every scenario. There are two major types of AI:  
- **Narrow AI (Weak AI):** Focused on a single task, like voice assistants, chatbots, or recommendation systems.  
- **General AI (Strong AI):** Hypothetical AI with human-like reasoning abilities that can perform any intellectual task a human can.  

Real-world applications:  
- Self-driving cars  
- Healthcare (diagnosis, drug discovery)  
- Finance (fraud detection, algorithmic trading)  
- Personal assistants (like Siri, Alexa, or Google Assistant)  
- Language translation  
- Image and speech recognition  

The main challenge with AI is balancing innovation with ethics, ensuring transparency, reducing biases in algorithms, and building systems that are trustworthy and aligned with human values.  

In short, AI is not just a single technology—it’s an evolving ecosystem reshaping industries and human interaction with machines.`,
  },
  {
    id: 3,
    sender: "user",
    message: "Cool, write me a story",
  },
  {
    id: 4,
    sender: "assistant",
    message: `Once upon a time in a small coastal town, a boy named Arjun spent hours staring at the ocean waves. He believed they carried secrets of the universe, whispers of journeys across unknown lands. While others saw water meeting the shore, Arjun imagined entire civilizations beneath the waves.  

One evening, after a fierce storm, Arjun discovered a wooden chest washed up on the beach. Inside, he found old maps, strange symbols, and a journal written by an explorer who vanished centuries ago. The journal spoke of "The City of Echoes," a mythical underwater place where every thought manifests as sound. Driven by curiosity, Arjun began deciphering the symbols and retracing the explorer’s route.  

Weeks turned into months. He built a small raft, surviving on the fish he caught and the stars guiding him. One night, he reached an island invisible on any modern map. A cave led him deep below, where glowing stones illuminated murals of humans and sea creatures coexisting. As he walked further, the walls vibrated with whispers—his own thoughts echoing back to him.  

The City of Echoes was real. Its power was overwhelming. Every doubt, every dream, every fear—voiced aloud by the cavern itself. Arjun realized the place wasn’t meant to be inhabited but understood: it was a mirror of the mind, teaching him to confront his own inner world.  

He returned home changed. From then on, whenever he gazed at the waves, he no longer sought mysteries outside but listened to the echoes within himself. The ocean hadn’t given him answers—it had taught him how to ask better questions.`,
  },
  {
    id: 5,
    sender: "user",
    message: "Summarize it",
  },
  {
    id: 6,
    sender: "assistant",
    message: `The story follows Arjun, a boy fascinated by the ocean. After discovering a washed-up chest, he finds clues about the mythical "City of Echoes." His journey takes him to an island where his thoughts manifest into sound. There, he learns the city is a metaphorical mirror of the mind. Returning home, he realizes the true exploration is within himself.`,
  },
];

const Chat = () => {
  const [messages, setMessages] = useState(mockChat);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to bottom when new message is added
  React.useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: "user", message: input },
    ]);
    setInput("");
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-3"
          contentContainerStyle={{ paddingBottom: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) =>
            msg.sender === "user" ? (
              // USER BUBBLE
              <View
                key={msg.id}
                className="my-2 ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-[#2e2e2e] px-4 py-3 shadow-sm"
              >
                <Text className="text-base text-white">{msg.message}</Text>
              </View>
            ) : (
              // ASSISTANT (FULL WIDTH TEXT)
              <View key={msg.id} className="my-3">
                <Text className="text-base text-gray-200 leading-relaxed">
                  {msg.message}
                </Text>
              </View>
            )
          )}
        </ScrollView>

        {/* Input Bar */}
        <View className="flex-row items-center bg-black p-3">
          <TextInput
            className="mr-3 flex-1 rounded-full bg-[#2e2e2e] p-4 text-base text-white"
            placeholder="Type your message..."
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
            onFocus={() => {
              setTimeout(() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollToEnd({ animated: true });
                }
              }, 250);
            }}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            className="rounded-full bg-[#2e2e2e] py-4 px-6"
            onPress={handleSend}
          >
            <Text className="text-base font-bold text-white">Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
