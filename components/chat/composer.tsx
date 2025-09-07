import { useTheme } from "@/hooks/useTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { Audio } from "expo-av";
// import * as DocumentPicker from "expo-document-picker";
// import * as ImagePicker from "expo-image-picker";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FancyButton from "../common/button";

// DEMO

// MAXIMUM 4 IMAGES AND 2 FILES
const demoImages: PickedImage[] = [
  {
    uri: "https://placekitten.com/200/200",
    mime: "image/jpeg",
    width: 200,
    height: 200,
    fileName: "kitten1.jpg",
  },
  {
    uri: "https://placekitten.com/201/200",
    mime: "image/jpeg",
    width: 201,
    height: 200,
    fileName: "kitten2.jpg",
  },
  {
    uri: "https://placekitten.com/202/200",
    mime: "image/jpeg",
    width: 202,
    height: 200,
    fileName: "kitten3.jpg",
  },
  {
    uri: "https://placekitten.com/200/200",
    mime: "image/jpeg",
    width: 200,
    height: 200,
    fileName: "kitten1.jpg",
  },
];
const demoFiles: PickedFile[] = [
  {
    uri: "file:///demo/docs/sample1.pdf",
    name: "Sample Document.pdf",
    size: 120000,
    mimeType: "application/pdf",
  },
  {
    uri: "file:///demo/docs/report.docx",
    name: "Report.docx",
    size: 45000,
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
];

/** TYPES */
type PickedImage = {
  uri: string;
  mime?: string | null;
  width?: number;
  height?: number;
  fileName?: string;
};

type PickedFile = {
  uri: string;
  name: string;
  size?: number | null;
  mimeType?: string | null;
};

type Props = {
  onSendText?: (text: string) => void;
  onSendVoice?: (audio: { uri: string; durationMs: number }) => void;
  onSendImages?: (images: PickedImage[]) => void;
  onSendFiles?: (files: PickedFile[]) => void;
  placeholder?: string;
  /** Optional: disable voice or attachments if you want to narrow usage */
  enableVoice?: boolean;
  enableAttachments?: boolean;
  maxLength?: number; // max length for text input
};

const MAX_INPUT_HEIGHT = 140; // keeps it elegant
const MIN_INPUT_HEIGHT = 44;

const ChatComposer: React.FC<Props> = ({
  onSendText,
  onSendVoice,
  onSendImages,
  onSendFiles,
  placeholder = "Message…",
  enableVoice = true,
  enableAttachments = true,
  maxLength = 1000,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // TEXT
  const [text, setText] = useState("");
  const inputHeight = useRef(new Animated.Value(MIN_INPUT_HEIGHT)).current;
  const contentHeightRef = useRef(MIN_INPUT_HEIGHT);

  // ATTACHMENTS
  const [images, setImages] = useState<PickedImage[]>(demoImages);
  const [files, setFiles] = useState<PickedFile[]>(demoFiles);

  // PREVIEW ANIMATIONS
  const previewOpacity = useRef(new Animated.Value(0)).current;
  const previewTranslateY = useRef(new Animated.Value(8)).current;

  // RECORDING
  //   const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSomethingToSend =
    text.trim().length > 0 || images.length > 0 || files.length > 0;

  /** Smoothly animate input height as the content grows/shrinks */
  const animateInputHeight = useCallback(
    (h: number) => {
      const clamped = Math.max(MIN_INPUT_HEIGHT, Math.min(MAX_INPUT_HEIGHT, h));
      Animated.timing(inputHeight, {
        toValue: clamped,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    },
    [inputHeight]
  );

  /** Show / hide preview tray */
  const showPreview = useCallback(
    (visible: boolean) => {
      Animated.parallel([
        Animated.timing(previewOpacity, {
          toValue: visible ? 1 : 0,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(previewTranslateY, {
          toValue: visible ? 0 : 8,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    },
    [previewOpacity, previewTranslateY]
  );

  useEffect(() => {
    showPreview(images.length > 0 || files.length > 0);
  }, [images.length, files.length, showPreview]);

  /** Start/Stop Recording */
  //   const startRecording = useCallback(async () => {
  //     try {
  //       const perm = await Audio.requestPermissionsAsync();
  //       if (!perm.granted) return;

  //       await Audio.setAudioModeAsync({
  //         allowsRecordingIOS: true,
  //         playsInSilentModeIOS: true,
  //         staysActiveInBackground: false,
  //       });

  //       const rec = new Audio.Recording();
  //       await rec.prepareToRecordAsync(
  //         Audio.RecordingOptionsPresets.HIGH_QUALITY
  //       );
  //       await rec.startAsync();

  //       setRecording(rec);
  //       setIsRecording(true);
  //       setRecordMs(0);

  //       // timer
  //       timerRef.current = setInterval(async () => {
  //         try {
  //           const status = await rec.getStatusAsync();
  //           if (status.isRecording) {
  //             setRecordMs(status.durationMillis ?? 0);
  //           }
  //         } catch {}
  //       }, 200);

  //       // pulse anim
  //       Animated.loop(
  //         Animated.sequence([
  //           Animated.timing(pulse, {
  //             toValue: 1,
  //             duration: 700,
  //             useNativeDriver: true,
  //             easing: Easing.inOut(Easing.quad),
  //           }),
  //           Animated.timing(pulse, {
  //             toValue: 0,
  //             duration: 700,
  //             useNativeDriver: true,
  //             easing: Easing.inOut(Easing.quad),
  //           }),
  //         ])
  //       ).start();
  //     } catch (e) {
  //       // silently ignore / or toast
  //     }
  //   }, [pulse]);

  //   const stopRecording = useCallback(async () => {
  //     if (!recording) return;
  //     try {
  //       await recording.stopAndUnloadAsync();
  //       const uri = recording.getURI();
  //       const status = await recording.getStatusAsync();
  //       const duration = status.durationMillis ?? recordMs;

  //       if (uri && onSendVoice) {
  //         onSendVoice({ uri, durationMs: duration });
  //       }
  //     } catch {
  //     } finally {
  //       setIsRecording(false);
  //       setRecording(null);
  //       if (timerRef.current) {
  //         clearInterval(timerRef.current);
  //         timerRef.current = null;
  //       }
  //       pulse.stopAnimation();
  //       pulse.setValue(0);
  //     }
  //   }, [recordMs, recording, onSendVoice, pulse]);

  /** Attachments */
  const pickImages = useCallback(async () => {
    // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // if (status !== "granted") return;
    // const res = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   quality: 0.9,
    //   allowsMultipleSelection: true,
    //   selectionLimit: 6,
    // });
    // if (!res.canceled) {
    //   const mapped: PickedImage[] = res.assets.map((a: any) => ({
    //     uri: a.uri,
    //     width: a.width,
    //     height: a.height,
    //     mime: a.mimeType ?? null,
    //     fileName: a.fileName ?? undefined,
    //   }));
    //   setImages((prev) => [...prev, ...mapped]);
    // }
  }, []);

  const takePhoto = useCallback(async () => {
    // const camPerm = await ImagePicker.requestCameraPermissionsAsync();
    // if (camPerm.status !== "granted") return;
    // const res = await ImagePicker.launchCameraAsync({
    //   quality: 0.9,
    // });
    // if (!res.canceled) {
    //   const a = res.assets[0];
    //   setImages((prev) => [
    //     ...prev,
    //     {
    //       uri: a.uri,
    //       width: a.width,
    //       height: a.height,
    //       mime: a.mimeType ?? null,
    //       fileName: a.fileName ?? undefined,
    //     },
    //   ]);
    // }
  }, []);

  const pickFiles = useCallback(async () => {
    // const res = await DocumentPicker.getDocumentAsync({
    //   multiple: true,
    //   copyToCacheDirectory: true,
    //   type: "*/*",
    // });
    // if (res.canceled) return;
    // const mapped: PickedFile[] = res.assets.map((f: any) => ({
    //   uri: f.uri,
    //   name: f.name,
    //   size: f.size ?? null,
    //   mimeType: f.mimeType ?? null,
    // }));
    // setFiles((prev) => [...prev, ...mapped]);
  }, []);

  const removeImage = useCallback((uri: string) => {
    setImages((prev) => prev.filter((i) => i.uri !== uri));
  }, []);

  const removeFile = useCallback((uri: string) => {
    setFiles((prev) => prev.filter((f) => f.uri !== uri));
  }, []);

  /** Send */
  const handleSend = useCallback(() => {
    const trimmed = text.trim();

    const sendImagesNow = images.length > 0 && onSendImages;
    const sendFilesNow = files.length > 0 && onSendFiles;
    const sendTextNow = trimmed.length > 0 && onSendText;

    // Fire each payload individually so the parent can handle parallel uploads
    if (sendImagesNow) onSendImages!(images);
    if (sendFilesNow) onSendFiles!(files);
    if (sendTextNow) onSendText!(trimmed);

    // reset local state only if anything was sent
    if (sendImagesNow || sendFilesNow || sendTextNow) {
      setText("");
      setImages([]);
      setFiles([]);
      animateInputHeight(MIN_INPUT_HEIGHT);
      Keyboard.dismiss();
    }
  }, [
    text,
    images,
    files,
    onSendText,
    onSendImages,
    onSendFiles,
    animateInputHeight,
  ]);

  /** Icons */
  const MicOrSendButton = useMemo(() => {
    if (hasSomethingToSend) {
      return (
        <FancyButton
          onPress={handleSend}
          iconName="arrow-up"
          loading={false}
          size="sm"
          accessibilityLabel="Send"
          type="tertiary"
          iconStyles={{ backgroundColor: theme.accent }}
          iconColor={theme.textLight || theme.text}
        />
      );
    }

    if (!enableVoice) return null;

    return (
      <FancyButton
        type="tertiary"
        accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
        //   onPress={isRecording ? stopRecording : startRecording}
        onPress={() => {}}
        SvgIcon={
          <MaterialCommunityIcons
            name={isRecording ? "stop" : "microphone"}
            size={22}
            color={theme.textLight || theme.text}
          />
        }
        iconStyles={{ backgroundColor: theme.accent }}
        loading={false}
        // pulse animated value (optional)
        pulse={pulse}
        size="sm"
      />
    );
  }, [
    enableVoice,
    hasSomethingToSend,
    handleSend,
    isRecording,
    // startRecording,
    // stopRecording,
    pulse,
    theme.accent,
    theme.card,
    theme.textLight,
    theme.text,
  ]);

  /** Recording pill (timer) */
  const RecordingPill = useMemo(() => {
    if (!isRecording) return null;
    const secs = Math.floor(recordMs / 1000);
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    return (
      <View className="flex-row items-center rounded-full px-3 py-1 bg-red-500/10">
        <View className="h-2 w-2 rounded-full bg-red-500 mr-2" />
        <Text className="text-xs font-space-bold text-red-500">
          {mm}:{ss}
        </Text>
      </View>
    );
  }, [isRecording, recordMs]);

  return (
    <View
      className="border-t pt-2"
      style={{
        borderTopColor: theme.card,
        paddingBottom: Math.max(insets.bottom - 6, 6),
        backgroundColor: theme.background,
      }}
    >
      {/* Attachments Preview */}
      <Animated.View
        style={{
          opacity: previewOpacity,
          transform: [{ translateY: previewTranslateY }],
        }}
        className={"py-2 gap-y-2 "}
      >
        {/* Attachments Preview Images */}
        {(images.length > 0 || files.length > 0) && (
          <View className="flex-row flex-wrap gap-2 ml-16">
            {images.map((item, idx) => (
              <View
                key={`${item.uri}-${idx}`}
                className="relative rounded-xl"
                style={{
                  width: "15%",
                  aspectRatio: 1,
                  backgroundColor: theme.card,
                }} // roughly 4 in a row
              >
                <Image
                  source={{ uri: item.uri }}
                  className="w-full h-full rounded-xl"
                />
                <Pressable
                  onPress={() => removeImage(item.uri)}
                  className="absolute -top-2 -right-2 h-6 w-6 items-center justify-center rounded-full bg-black"
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
        {files.length > 0 && (
          <View className="flex-row flex-wrap gap-2 ml-16">
            {files.map((item, idx) => (
              <View
                key={`${item.uri}-${idx}`}
                className="flex-row items-center rounded-xl px-3 py-2"
                style={{ backgroundColor: theme.card }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={theme.text}
                />
                <Text
                  className="ml-2 text-xs font-space"
                  numberOfLines={1}
                  style={{ maxWidth: 160, color: theme.text }}
                >
                  {item.name}
                </Text>
                <Pressable
                  onPress={() => removeFile(item.uri)}
                  className="ml-2"
                >
                  <Ionicons name="close" size={14} color={theme.text} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Composer Row */}
      <View className="flex-row items-center gap-x-2 px-3">
        <View className="self-end mb-1.5">
          <FancyButton
            accessibilityLabel="Add attachments"
            onPress={() => Keyboard.dismiss()}
            //   onLongPress={pickFiles}
            //     onPressOut={() => {}}
            type="tertiary"
            iconName="add"
            size="sm"
            iconColor={theme.text}
            iconStyles={{ backgroundColor: theme.card }}
          />
        </View>

        {/* Input + recording pill */}
        <View className="flex-1 ">
          {RecordingPill && (
            <View className="mb-2 items-start">{RecordingPill}</View>
          )}

          <Animated.View
            className="rounded-3xl flex-row items-center"
            style={{
              backgroundColor: theme.card,
              height: inputHeight,
              justifyContent: "center",
            }}
          >
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={theme.textSecondary}
              multiline
              className="flex-1 text-base font-space mx-1 ml-4"
              style={{ color: theme.text, paddingVertical: 8 }}
              onContentSizeChange={(e) => {
                const h = e.nativeEvent.contentSize.height + 16; // padding buffer
                contentHeightRef.current = h;
                animateInputHeight(h);
              }}
              onFocus={() => showPreview(images.length > 0 || files.length > 0)}
              submitBehavior="newline"
              onSubmitEditing={() => {
                if (hasSomethingToSend) handleSend();
              }}
              blurOnSubmit={false}
              maxLength={maxLength}
            />

            {/* Mic / Send */}
            <View className="rounded-full self-end m-1">{MicOrSendButton}</View>
          </Animated.View>

          {/* Attach actions under input (buttons like camera / gallery / files) */}
          {enableAttachments && (
            <View className="mt-2 flex-row items-center gap-2">
              <Pressable
                onPress={takePhoto}
                className="rounded-full p-2"
                style={{ backgroundColor: theme.card }}
              >
                <Ionicons name="camera" size={18} color={theme.text} />
              </Pressable>
              <Pressable
                onPress={pickImages}
                className="rounded-full p-2"
                style={{ backgroundColor: theme.card }}
              >
                <Ionicons name="image" size={18} color={theme.text} />
              </Pressable>
              <Pressable
                onPress={pickFiles}
                className="rounded-full p-2"
                style={{ backgroundColor: theme.card }}
              >
                <Ionicons name="document-text" size={18} color={theme.text} />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ChatComposer;
