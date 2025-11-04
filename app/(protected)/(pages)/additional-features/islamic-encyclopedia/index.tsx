// // IslamicEncyclopedia.tsx
// import ProgressBar from "@/components/pagePartials/prayerTimes/progressBar";
// import { useTheme } from "@/hooks/useTheme";
// import { Ionicons } from "@expo/vector-icons";
// import { useMemo, useState } from "react";
// import {
//   Modal,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// // Types
// interface EncyclopediaArticle {
//   id: string;
//   title: string;
//   titleArabic?: string;
//   category: string;
//   subcategory?: string;
//   summary: string;
//   content: string;
//   arabicContent?: string;
//   references: Reference[];
//   relatedTopics: string[];
//   tags: string[];
//   readTime: number; // in minutes
//   difficulty: "beginner" | "intermediate" | "advanced";
//   verified: boolean;
//   audioUrl?: string;
//   lastUpdated: Date;
//   views: number;
//   bookmarked?: boolean;
//   readProgress?: number;
// }

// interface Reference {
//   source: string;
//   citation: string;
//   type: "quran" | "hadith" | "scholar" | "book";
// }

// interface Category {
//   id: string;
//   name: string;
//   nameArabic: string;
//   icon: string;
//   color: string;
//   articleCount: number;
//   description: string;
// }

// // Sample Categories
// const CATEGORIES: Category[] = [
//   {
//     id: "aqeedah",
//     name: "Aqeedah",
//     nameArabic: "العقيدة",
//     icon: "star",
//     color: "#3b82f6",
//     articleCount: 45,
//     description: "Islamic creed and belief system",
//   },
//   {
//     id: "fiqh",
//     name: "Fiqh",
//     nameArabic: "الفقه",
//     icon: "book",
//     color: "#10b981",
//     articleCount: 120,
//     description: "Islamic jurisprudence and rulings",
//   },
//   {
//     id: "hadith",
//     name: "Hadith",
//     nameArabic: "الحديث",
//     icon: "document-text",
//     color: "#f59e0b",
//     articleCount: 200,
//     description: "Prophetic traditions and sayings",
//   },
//   {
//     id: "seerah",
//     name: "Seerah",
//     nameArabic: "السيرة",
//     icon: "person",
//     color: "#8b5cf6",
//     articleCount: 67,
//     description: "Biography of Prophet Muhammad ﷺ",
//   },
//   {
//     id: "tafsir",
//     name: "Tafsir",
//     nameArabic: "التفسير",
//     icon: "book-outline",
//     color: "#ec4899",
//     articleCount: 150,
//     description: "Quranic exegesis and interpretation",
//   },
//   {
//     id: "history",
//     name: "History",
//     nameArabic: "التاريخ",
//     icon: "time",
//     color: "#14b8a6",
//     articleCount: 89,
//     description: "Islamic history and civilization",
//   },
//   {
//     id: "akhlaq",
//     name: "Akhlaq",
//     nameArabic: "الأخلاق",
//     icon: "heart",
//     color: "#f43f5e",
//     articleCount: 54,
//     description: "Islamic ethics and morality",
//   },
//   {
//     id: "dua",
//     name: "Du'a & Dhikr",
//     nameArabic: "الدعاء والذكر",
//     icon: "hand-left",
//     color: "#6366f1",
//     articleCount: 78,
//     description: "Supplications and remembrance",
//   },
// ];

// // Sample Articles
// const SAMPLE_ARTICLES: EncyclopediaArticle[] = [
//   {
//     id: "1",
//     title: "The Five Pillars of Islam",
//     titleArabic: "أركان الإسلام الخمسة",
//     category: "aqeedah",
//     summary:
//       "The fundamental acts of worship that form the foundation of Muslim life and practice.",
//     content: `The Five Pillars of Islam are the foundation of Muslim life:

// 1. **Shahada (Faith)**: The declaration of faith - "There is no god but Allah, and Muhammad is His messenger."

// 2. **Salah (Prayer)**: Performing the five daily prayers at prescribed times, facing Mecca.

// 3. **Zakat (Charity)**: Giving a portion of one's wealth to those in need, typically 2.5% annually.

// 4. **Sawm (Fasting)**: Fasting during the month of Ramadan from dawn until sunset.

// 5. **Hajj (Pilgrimage)**: Making the pilgrimage to Mecca at least once in a lifetime if physically and financially able.

// These pillars were established by Prophet Muhammad ﷺ and are mentioned in various authentic hadith. They represent both the spiritual and practical aspects of Islamic life, connecting the believer to Allah and to the Muslim community.

// Each pillar has specific conditions, benefits, and wisdom behind it that have been explained by scholars throughout Islamic history.`,
//     arabicContent: "المحتوى العربي هنا...",
//     references: [
//       {
//         source: "Sahih Muslim",
//         citation: "Book 1, Hadith 1",
//         type: "hadith",
//       },
//       {
//         source: "Sahih Bukhari",
//         citation: "Book 2, Hadith 7",
//         type: "hadith",
//       },
//     ],
//     relatedTopics: ["2", "3", "4"],
//     tags: ["pillars", "fundamentals", "worship", "basics"],
//     readTime: 8,
//     difficulty: "beginner",
//     verified: true,
//     views: 15420,
//     lastUpdated: new Date(),
//   },
//   {
//     id: "2",
//     title: "Wudu: The Ablution",
//     titleArabic: "الوضوء",
//     category: "fiqh",
//     summary:
//       "The ritual purification performed before prayers and other acts of worship.",
//     content: `Wudu (ablution) is the Islamic procedure for washing parts of the body using clean water. It is a prerequisite for performing salah (prayer) and is highly recommended before other acts of worship.

// **Steps of Wudu:**

// 1. Intention (Niyyah) in the heart
// 2. Say "Bismillah" (In the name of Allah)
// 3. Wash hands three times
// 4. Rinse mouth three times
// 5. Rinse nose three times
// 6. Wash face three times
// 7. Wash arms to elbows three times (right, then left)
// 8. Wipe head once
// 9. Wipe ears once
// 10. Wash feet to ankles three times (right, then left)

// **Virtues of Wudu:**
// - Forgiveness of sins
// - Spiritual purification
// - Physical cleanliness
// - Preparation for standing before Allah

// The Prophet ﷺ said: "When a Muslim performs wudu and washes his face, every sin he committed with his eyes is washed away with the water."`,
//     references: [
//       {
//         source: "Sahih Muslim",
//         citation: "Book 2, Hadith 2",
//         type: "hadith",
//       },
//       {
//         source: "Quran",
//         citation: "5:6",
//         type: "quran",
//       },
//     ],
//     relatedTopics: ["1", "3"],
//     tags: ["purification", "prayer", "worship", "fiqh"],
//     readTime: 6,
//     difficulty: "beginner",
//     verified: true,
//     views: 12350,
//     lastUpdated: new Date(),
//   },
//   {
//     id: "3",
//     title: "The Names of Allah (Asma ul Husna)",
//     titleArabic: "أسماء الله الحسنى",
//     category: "aqeedah",
//     summary:
//       "The 99 beautiful names of Allah that describe His attributes and qualities.",
//     content: `The Asma ul Husna (Beautiful Names of Allah) are the names used to describe Allah in Islam. There are traditionally 99 names mentioned in Islamic tradition.

// **Understanding the Names:**

// Each name reveals a unique attribute of Allah:
// - **Ar-Rahman** (The Most Merciful): Allah's mercy encompasses all of creation
// - **Ar-Rahim** (The Most Compassionate): Special mercy for believers
// - **Al-Malik** (The King): Absolute sovereignty over all creation
// - **Al-Quddus** (The Pure): Perfect and free from all imperfection
// - **As-Salam** (The Source of Peace): Perfection and peace

// **Benefits of Learning the Names:**
// 1. Deeper understanding of Allah
// 2. Strengthening faith and connection
// 3. Guidance in worship and supplication
// 4. Spiritual growth and reflection

// The Prophet ﷺ said: "Allah has ninety-nine names, one hundred minus one. Whoever enumerates them will enter Paradise."

// Muslims are encouraged to study these names, understand their meanings, and call upon Allah by these names in their prayers and supplications.`,
//     references: [
//       {
//         source: "Sahih Bukhari",
//         citation: "Book 75, Hadith 419",
//         type: "hadith",
//       },
//       {
//         source: "Quran",
//         citation: "7:180",
//         type: "quran",
//       },
//     ],
//     relatedTopics: ["1", "8"],
//     tags: ["names", "attributes", "aqeedah", "Allah"],
//     readTime: 10,
//     difficulty: "intermediate",
//     verified: true,
//     audioUrl: "https://example.com/audio/asma-ul-husna.mp3",
//     views: 23100,
//     lastUpdated: new Date(),
//   },
//   {
//     id: "4",
//     title: "Ramadan: The Blessed Month",
//     titleArabic: "رمضان المبارك",
//     category: "fiqh",
//     subcategory: "fasting",
//     summary:
//       "The ninth month of the Islamic calendar, observed by Muslims worldwide as a month of fasting, prayer, and reflection.",
//     content: `Ramadan is the ninth month of the Islamic lunar calendar and is observed by Muslims worldwide as a month of fasting (sawm), prayer, reflection, and community.

// **Key Aspects of Ramadan:**

// **Fasting (Sawm):**
// - Abstaining from food, drink, and intimate relations from dawn to sunset
// - One of the Five Pillars of Islam
// - Obligatory for adult Muslims (with exemptions for illness, travel, etc.)

// **Spiritual Benefits:**
// - Increased devotion and God-consciousness (taqwa)
// - Self-discipline and restraint
// - Empathy for the less fortunate
// - Forgiveness of past sins

// **Special Features:**
// - **Laylat al-Qadr** (Night of Power): Better than a thousand months
// - **Taraweeh**: Special night prayers
// - **Increased Quran recitation**: The month when the Quran was revealed
// - **Iftar**: Breaking fast with family and community
// - **Suhoor**: Pre-dawn meal

// **Eid al-Fitr:**
// The celebration marking the end of Ramadan, a time of joy, charity, and thanksgiving.

// The Prophet ﷺ said: "When Ramadan comes, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained."`,
//     references: [
//       {
//         source: "Sahih Bukhari",
//         citation: "Book 31, Hadith 1",
//         type: "hadith",
//       },
//       {
//         source: "Quran",
//         citation: "2:183-185",
//         type: "quran",
//       },
//     ],
//     relatedTopics: ["1", "2", "7"],
//     tags: ["ramadan", "fasting", "sawm", "worship"],
//     readTime: 12,
//     difficulty: "beginner",
//     verified: true,
//     views: 31200,
//     lastUpdated: new Date(),
//   },
// ];

// const IslamicEncyclopedia = () => {
//   const { theme } = useTheme();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [articles, setArticles] =
//     useState<EncyclopediaArticle[]>(SAMPLE_ARTICLES);
//   const [selectedArticle, setSelectedArticle] =
//     useState<EncyclopediaArticle | null>(null);
//   const [showArticleModal, setShowArticleModal] = useState(false);
//   const [bookmarks, setBookmarks] = useState<string[]>([]);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [sortBy, setSortBy] = useState<"popular" | "recent" | "alphabetical">(
//     "popular"
//   );
//   const [showFilters, setShowFilters] = useState(false);

//   // Filtered articles
//   const filteredArticles = useMemo(() => {
//     let filtered = [...articles];

//     // Filter by category
//     if (selectedCategory) {
//       filtered = filtered.filter((a) => a.category === selectedCategory);
//     }

//     // Filter by search query
//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter(
//         (a) =>
//           a.title.toLowerCase().includes(query) ||
//           a.summary.toLowerCase().includes(query) ||
//           a.tags.some((tag) => tag.toLowerCase().includes(query))
//       );
//     }

//     // Sort
//     switch (sortBy) {
//       case "popular":
//         filtered.sort((a, b) => b.views - a.views);
//         break;
//       case "recent":
//         filtered.sort(
//           (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
//         );
//         break;
//       case "alphabetical":
//         filtered.sort((a, b) => a.title.localeCompare(b.title));
//         break;
//     }

//     return filtered;
//   }, [articles, selectedCategory, searchQuery, sortBy]);

//   const toggleBookmark = (articleId: string) => {
//     setBookmarks((prev) =>
//       prev.includes(articleId)
//         ? prev.filter((id) => id !== articleId)
//         : [...prev, articleId]
//     );
//   };

//   const openArticle = (article: EncyclopediaArticle) => {
//     setSelectedArticle(article);
//     setShowArticleModal(true);
//   };

//   const totalArticles = useMemo(
//     () => CATEGORIES.reduce((sum, cat) => sum + cat.articleCount, 0),
//     []
//   );

//   return (
//     <View className="flex-1" style={{ backgroundColor: theme.background }}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View
//           className="rounded-2xl border p-4 mb-4"
//           style={{
//             borderColor: theme.accentLight ?? "#ffffff22",
//             backgroundColor: theme.card,
//           }}
//         >
//           <View className="flex-row items-center justify-between mb-4">
//             <View className="flex-1">
//               <Text
//                 className="text-2xl font-bold"
//                 style={{ color: theme.text }}
//               >
//                 Islamic Encyclopedia
//               </Text>
//               <Text
//                 className="text-sm mt-1"
//                 style={{ color: theme.textSecondary }}
//               >
//                 Comprehensive knowledge base
//               </Text>
//             </View>
//             <View
//               className="w-14 h-14 rounded-full items-center justify-center"
//               style={{
//                 backgroundColor: theme.primaryLight ?? theme.primary + "20",
//               }}
//             >
//               <Ionicons name="library" size={28} color={theme.primary} />
//             </View>
//           </View>

//           {/* Stats */}
//           <View
//             className="flex-row justify-around py-3 rounded-xl"
//             style={{ backgroundColor: theme.background }}
//           >
//             <View className="items-center">
//               <Text
//                 className="text-2xl font-bold"
//                 style={{ color: theme.primary }}
//               >
//                 {totalArticles}+
//               </Text>
//               <Text
//                 className="text-xs mt-1"
//                 style={{ color: theme.textSecondary }}
//               >
//                 Articles
//               </Text>
//             </View>
//             <View className="items-center">
//               <Text
//                 className="text-2xl font-bold"
//                 style={{ color: theme.primary }}
//               >
//                 {CATEGORIES.length}
//               </Text>
//               <Text
//                 className="text-xs mt-1"
//                 style={{ color: theme.textSecondary }}
//               >
//                 Categories
//               </Text>
//             </View>
//             <View className="items-center">
//               <Text
//                 className="text-2xl font-bold"
//                 style={{ color: theme.primary }}
//               >
//                 {bookmarks.length}
//               </Text>
//               <Text
//                 className="text-xs mt-1"
//                 style={{ color: theme.textSecondary }}
//               >
//                 Bookmarks
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Search Bar */}
//         <View
//           className="rounded-xl border p-3 mb-4 flex-row items-center"
//           style={{
//             borderColor: theme.accentLight ?? "#ffffff22",
//             backgroundColor: theme.card,
//           }}
//         >
//           <Ionicons name="search" size={20} color={theme.textSecondary} />
//           <TextInput
//             className="flex-1 ml-3"
//             placeholder="Search articles, topics, scholars..."
//             placeholderTextColor={theme.textSecondary}
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             style={{ color: theme.text, fontSize: 15 }}
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchQuery("")}>
//               <Ionicons
//                 name="close-circle"
//                 size={20}
//                 color={theme.textSecondary}
//               />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Filter & Sort Bar */}
//         <View className="flex-row items-center justify-between mb-4">
//           <View className="flex-row space-x-2">
//             <TouchableOpacity
//               onPress={() => setShowFilters(!showFilters)}
//               className="px-4 py-2 rounded-lg flex-row items-center"
//               style={{
//                 backgroundColor: showFilters ? theme.primary : theme.card,
//                 borderWidth: 1,
//                 borderColor: theme.accentLight,
//               }}
//             >
//               <Ionicons
//                 name="options"
//                 size={16}
//                 color={showFilters ? "#fff" : theme.textSecondary}
//                 style={{ marginRight: 4 }}
//               />
//               <Text
//                 className="text-sm font-semibold"
//                 style={{ color: showFilters ? "#fff" : theme.textSecondary }}
//               >
//                 Filter
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               className="px-4 py-2 rounded-lg flex-row items-center"
//               style={{
//                 backgroundColor: theme.card,
//                 borderWidth: 1,
//                 borderColor: theme.accentLight,
//               }}
//               onPress={() => {
//                 const modes: (typeof sortBy)[] = [
//                   "popular",
//                   "recent",
//                   "alphabetical",
//                 ];
//                 const currentIndex = modes.indexOf(sortBy);
//                 setSortBy(modes[(currentIndex + 1) % modes.length]);
//               }}
//             >
//               <Ionicons
//                 name="swap-vertical"
//                 size={16}
//                 color={theme.textSecondary}
//                 style={{ marginRight: 4 }}
//               />
//               <Text
//                 className="text-sm font-semibold"
//                 style={{ color: theme.textSecondary }}
//               >
//                 {sortBy === "popular"
//                   ? "Popular"
//                   : sortBy === "recent"
//                     ? "Recent"
//                     : "A-Z"}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
//             className="w-10 h-10 rounded-lg items-center justify-center"
//             style={{
//               backgroundColor: theme.card,
//               borderWidth: 1,
//               borderColor: theme.accentLight,
//             }}
//           >
//             <Ionicons
//               name={viewMode === "grid" ? "grid" : "list"}
//               size={18}
//               color={theme.textSecondary}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Categories */}
//         <View className="mb-4">
//           <View className="flex-row items-center justify-between mb-3">
//             <Text
//               className="text-sm font-semibold"
//               style={{ color: theme.textSecondary }}
//             >
//               CATEGORIES
//             </Text>
//             {selectedCategory && (
//               <TouchableOpacity onPress={() => setSelectedCategory(null)}>
//                 <Text
//                   className="text-sm font-semibold"
//                   style={{ color: theme.primary }}
//                 >
//                   Clear
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {CATEGORIES.map((category) => (
//               <CategoryCard
//                 key={category.id}
//                 category={category}
//                 isSelected={selectedCategory === category.id}
//                 onPress={() =>
//                   setSelectedCategory(
//                     selectedCategory === category.id ? null : category.id
//                   )
//                 }
//                 theme={theme}
//               />
//             ))}
//           </ScrollView>
//         </View>

//         {/* Articles */}
//         <View className="mb-4">
//           <View className="flex-row items-center justify-between mb-3">
//             <Text
//               className="text-sm font-semibold"
//               style={{ color: theme.textSecondary }}
//             >
//               {selectedCategory
//                 ? CATEGORIES.find(
//                     (c) => c.id === selectedCategory
//                   )?.name.toUpperCase()
//                 : "ALL ARTICLES"}{" "}
//               ({filteredArticles.length})
//             </Text>
//           </View>

//           {viewMode === "grid" ? (
//             <View className="flex-row flex-wrap justify-between">
//               {filteredArticles.map((article) => (
//                 <ArticleCardGrid
//                   key={article.id}
//                   article={article}
//                   theme={theme}
//                   isBookmarked={bookmarks.includes(article.id)}
//                   onPress={() => openArticle(article)}
//                   onToggleBookmark={() => toggleBookmark(article.id)}
//                   category={CATEGORIES.find((c) => c.id === article.category)!}
//                 />
//               ))}
//             </View>
//           ) : (
//             <View>
//               {filteredArticles.map((article) => (
//                 <ArticleCardList
//                   key={article.id}
//                   article={article}
//                   theme={theme}
//                   isBookmarked={bookmarks.includes(article.id)}
//                   onPress={() => openArticle(article)}
//                   onToggleBookmark={() => toggleBookmark(article.id)}
//                   category={CATEGORIES.find((c) => c.id === article.category)!}
//                 />
//               ))}
//             </View>
//           )}
//         </View>

//         {filteredArticles.length === 0 && (
//           <View className="items-center py-12">
//             <Ionicons
//               name="document-outline"
//               size={64}
//               color={theme.textSecondary}
//             />
//             <Text
//               className="text-lg font-semibold mt-4"
//               style={{ color: theme.text }}
//             >
//               No Articles Found
//             </Text>
//             <Text
//               className="text-sm mt-2 text-center"
//               style={{ color: theme.textSecondary }}
//             >
//               Try adjusting your search or filters
//             </Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Article Detail Modal */}
//       <Modal
//         visible={showArticleModal}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setShowArticleModal(false)}
//       >
//         <View className="flex-1 justify-end">
//           <View
//             className="rounded-t-3xl flex-1"
//             style={{
//               backgroundColor: theme.background,
//               maxHeight: "95%",
//             }}
//           >
//             {selectedArticle && (
//               <ArticleDetailView
//                 article={selectedArticle}
//                 theme={theme}
//                 onClose={() => setShowArticleModal(false)}
//                 isBookmarked={bookmarks.includes(selectedArticle.id)}
//                 onToggleBookmark={() => toggleBookmark(selectedArticle.id)}
//                 category={
//                   CATEGORIES.find((c) => c.id === selectedArticle.category)!
//                 }
//                 relatedArticles={articles.filter((a) =>
//                   selectedArticle.relatedTopics.includes(a.id)
//                 )}
//                 onOpenRelated={(article) => {
//                   setSelectedArticle(article);
//                 }}
//               />
//             )}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// // Category Card Component
// const CategoryCard = ({
//   category,
//   isSelected,
//   onPress,
//   theme,
// }: {
//   category: Category;
//   isSelected: boolean;
//   onPress: () => void;
//   theme: any;
// }) => (
//   <TouchableOpacity
//     onPress={onPress}
//     className="mr-3 rounded-xl p-4 min-w-[140px]"
//     style={{
//       backgroundColor: isSelected ? category.color : theme.card,
//       borderWidth: 2,
//       borderColor: isSelected ? category.color : theme.accentLight,
//     }}
//   >
//     <View
//       className="w-12 h-12 rounded-full items-center justify-center mb-3"
//       style={{
//         backgroundColor: isSelected
//           ? "rgba(255,255,255,0.2)"
//           : category.color + "20",
//       }}
//     >
//       <Ionicons
//         name={category.icon as any}
//         size={24}
//         color={isSelected ? "#fff" : category.color}
//       />
//     </View>
//     <Text
//       className="font-bold mb-1"
//       style={{ color: isSelected ? "#fff" : theme.text }}
//     >
//       {category.name}
//     </Text>
//     <Text
//       className="text-xs mb-2"
//       style={{
//         color: isSelected ? "rgba(255,255,255,0.8)" : theme.textSecondary,
//       }}
//     >
//       {category.nameArabic}
//     </Text>
//     <Text
//       className="text-xs"
//       style={{
//         color: isSelected ? "rgba(255,255,255,0.9)" : theme.textSecondary,
//       }}
//     >
//       {category.articleCount} articles
//     </Text>
//   </TouchableOpacity>
// );

// // Article Card Grid Component
// const ArticleCardGrid = ({
//   article,
//   theme,
//   isBookmarked,
//   onPress,
//   onToggleBookmark,
//   category,
// }: {
//   article: EncyclopediaArticle;
//   theme: any;
//   isBookmarked: boolean;
//   onPress: () => void;
//   onToggleBookmark: () => void;
//   category: Category;
// }) => (
//   <TouchableOpacity
//     onPress={onPress}
//     className="rounded-xl border p-3 mb-3"
//     style={{
//       width: "48%",
//       borderColor: theme.accentLight ?? "#ffffff22",
//       backgroundColor: theme.card,
//     }}
//   >
//     <View className="flex-row items-start justify-between mb-2">
//       <View
//         className="px-2 py-1 rounded"
//         style={{ backgroundColor: category.color + "20" }}
//       >
//         <Text
//           className="text-[10px] font-bold"
//           style={{ color: category.color }}
//         >
//           {category.name.toUpperCase()}
//         </Text>
//       </View>
//       <TouchableOpacity onPress={onToggleBookmark}>
//         <Ionicons
//           name={isBookmarked ? "bookmark" : "bookmark-outline"}
//           size={18}
//           color={isBookmarked ? theme.primary : theme.textSecondary}
//         />
//       </TouchableOpacity>
//     </View>

//     <Text
//       className="font-bold mb-1 leading-5"
//       style={{ color: theme.text }}
//       numberOfLines={2}
//     >
//       {article.title}
//     </Text>

//     {article.titleArabic && (
//       <Text
//         className="text-xs mb-2"
//         style={{ color: theme.primary, textAlign: "right" }}
//         numberOfLines={1}
//       >
//         {article.titleArabic}
//       </Text>
//     )}

//     <Text
//       className="text-xs leading-4 mb-3"
//       style={{ color: theme.textSecondary }}
//       numberOfLines={3}
//     >
//       {article.summary}
//     </Text>

//     <View className="flex-row items-center justify-between">
//       <View className="flex-row items-center">
//         <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
//         <Text
//           className="text-[10px] ml-1"
//           style={{ color: theme.textSecondary }}
//         >
//           {article.readTime} min
//         </Text>
//       </View>
//       <View className="flex-row items-center">
//         <Ionicons name="eye-outline" size={12} color={theme.textSecondary} />
//         <Text
//           className="text-[10px] ml-1"
//           style={{ color: theme.textSecondary }}
//         >
//           {article.views}
//         </Text>
//       </View>
//       {article.verified && (
//         <Ionicons name="checkmark-circle" size={14} color={theme.accent} />
//       )}
//     </View>
//   </TouchableOpacity>
// );

// // Article Card List Component
// const ArticleCardList = ({
//   article,
//   theme,
//   isBookmarked,
//   onPress,
//   onToggleBookmark,
//   category,
// }: {
//   article: EncyclopediaArticle;
//   theme: any;
//   isBookmarked: boolean;
//   onPress: () => void;
//   onToggleBookmark: () => void;
//   category: Category;
// }) => (
//   <TouchableOpacity
//     onPress={onPress}
//     className="rounded-xl border p-4 mb-3 flex-row"
//     style={{
//       borderColor: theme.accentLight ?? "#ffffff22",
//       backgroundColor: theme.card,
//     }}
//   >
//     <View
//       className="w-16 h-16 rounded-xl items-center justify-center mr-3"
//       style={{ backgroundColor: category.color + "20" }}
//     >
//       <Ionicons name={category.icon as any} size={28} color={category.color} />
//     </View>

//     <View className="flex-1">
//       <View className="flex-row items-start justify-between mb-1">
//         <View className="flex-1">
//           <View className="flex-row items-center mb-1">
//             <Text
//               className="text-[10px] font-bold mr-2"
//               style={{ color: category.color }}
//             >
//               {category.name.toUpperCase()}
//             </Text>
//             {article.verified && (
//               <Ionicons
//                 name="checkmark-circle"
//                 size={12}
//                 color={theme.accent}
//               />
//             )}
//           </View>
//           <Text
//             className="font-bold leading-5 mb-1"
//             style={{ color: theme.text }}
//           >
//             {article.title}
//           </Text>
//           {article.titleArabic && (
//             <Text
//               className="text-xs mb-1"
//               style={{ color: theme.primary, textAlign: "right" }}
//             >
//               {article.titleArabic}
//             </Text>
//           )}
//         </View>
//         <TouchableOpacity onPress={onToggleBookmark} className="ml-2">
//           <Ionicons
//             name={isBookmarked ? "bookmark" : "bookmark-outline"}
//             size={20}
//             color={isBookmarked ? theme.primary : theme.textSecondary}
//           />
//         </TouchableOpacity>
//       </View>

//       <Text
//         className="text-xs leading-4 mb-2"
//         style={{ color: theme.textSecondary }}
//         numberOfLines={2}
//       >
//         {article.summary}
//       </Text>

//       <View className="flex-row items-center">
//         <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
//         <Text
//           className="text-[10px] ml-1 mr-3"
//           style={{ color: theme.textSecondary }}
//         >
//           {article.readTime} min read
//         </Text>
//         <Ionicons name="eye-outline" size={12} color={theme.textSecondary} />
//         <Text
//           className="text-[10px] ml-1 mr-3"
//           style={{ color: theme.textSecondary }}
//         >
//           {article.views.toLocaleString()} views
//         </Text>
//         {article.audioUrl && (
//           <View className="flex-row items-center">
//             <Ionicons name="headset" size={12} color={theme.primary} />
//             <Text className="text-[10px] ml-1" style={{ color: theme.primary }}>
//               Audio
//             </Text>
//           </View>
//         )}
//       </View>
//     </View>
//   </TouchableOpacity>
// );

// // Article Detail View Component
// const ArticleDetailView = ({
//   article,
//   theme,
//   onClose,
//   isBookmarked,
//   onToggleBookmark,
//   category,
//   relatedArticles,
//   onOpenRelated,
// }: {
//   article: EncyclopediaArticle;
//   theme: any;
//   onClose: () => void;
//   isBookmarked: boolean;
//   onToggleBookmark: () => void;
//   category: Category;
//   relatedArticles: EncyclopediaArticle[];
//   onOpenRelated: (article: EncyclopediaArticle) => void;
// }) => {
//   const [readProgress, setReadProgress] = useState(0);
//   const [showArabic, setShowArabic] = useState(false);
//   const [fontSize, setFontSize] = useState(15);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const handleScroll = (event: any) => {
//     const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
//     const progress =
//       (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;
//     setReadProgress(Math.min(100, Math.max(0, progress)));
//   };

//   const difficultyColors = {
//     beginner: "#10b981",
//     intermediate: "#f59e0b",
//     advanced: "#ef4444",
//   };

//   return (
//     <View className="flex-1">
//       {/* Header */}
//       <View
//         className="flex-row items-center justify-between p-4 border-b"
//         style={{ borderBottomColor: theme.accentLight }}
//       >
//         <TouchableOpacity
//           onPress={onClose}
//           className="w-10 h-10 rounded-full items-center justify-center"
//           style={{ backgroundColor: theme.card }}
//         >
//           <Ionicons name="chevron-down" size={24} color={theme.text} />
//         </TouchableOpacity>

//         <View className="flex-row items-center space-x-2">
//           {article.audioUrl && (
//             <TouchableOpacity
//               onPress={() => setIsPlaying(!isPlaying)}
//               className="w-10 h-10 rounded-full items-center justify-center"
//               style={{ backgroundColor: theme.primary }}
//             >
//               <Ionicons
//                 name={isPlaying ? "pause" : "play"}
//                 size={18}
//                 color="#fff"
//               />
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity
//             onPress={onToggleBookmark}
//             className="w-10 h-10 rounded-full items-center justify-center"
//             style={{ backgroundColor: theme.card }}
//           >
//             <Ionicons
//               name={isBookmarked ? "bookmark" : "bookmark-outline"}
//               size={20}
//               color={isBookmarked ? theme.primary : theme.textSecondary}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="w-10 h-10 rounded-full items-center justify-center"
//             style={{ backgroundColor: theme.card }}
//           >
//             <Ionicons
//               name="share-outline"
//               size={20}
//               color={theme.textSecondary}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Progress Bar */}
//       <View className="px-4 pt-2">
//         <ProgressBar
//           trackColor={theme.accentLight ?? "#ffffff16"}
//           fillColor={theme.primary}
//           pct={readProgress}
//         />
//         <View className="flex-row justify-between mt-1">
//           <Text className="text-[10px]" style={{ color: theme.textSecondary }}>
//             {Math.round(readProgress)}% read
//           </Text>
//           <Text className="text-[10px]" style={{ color: theme.textSecondary }}>
//             {article.readTime} min
//           </Text>
//         </View>
//       </View>

//       <ScrollView
//         className="flex-1 p-4"
//         showsVerticalScrollIndicator={false}
//         onScroll={handleScroll}
//         scrollEventThrottle={16}
//       >
//         {/* Category & Meta */}
//         <View className="flex-row items-center flex-wrap mb-3">
//           <View
//             className="px-3 py-1 rounded-full mr-2 mb-2"
//             style={{ backgroundColor: category.color + "20" }}
//           >
//             <Text
//               className="text-xs font-bold"
//               style={{ color: category.color }}
//             >
//               {category.name}
//             </Text>
//           </View>

//           <View
//             className="px-3 py-1 rounded-full mr-2 mb-2"
//             style={{
//               backgroundColor: difficultyColors[article.difficulty] + "20",
//             }}
//           >
//             <Text
//               className="text-xs font-semibold capitalize"
//               style={{ color: difficultyColors[article.difficulty] }}
//             >
//               {article.difficulty}
//             </Text>
//           </View>

//           {article.verified && (
//             <View
//               className="px-3 py-1 rounded-full flex-row items-center mb-2"
//               style={{ backgroundColor: theme.accent + "20" }}
//             >
//               <Ionicons
//                 name="checkmark-circle"
//                 size={12}
//                 color={theme.accent}
//               />
//               <Text
//                 className="text-xs font-semibold ml-1"
//                 style={{ color: theme.accent }}
//               >
//                 Verified
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Title */}
//         <Text
//           className="text-3xl font-bold mb-2 leading-10"
//           style={{ color: theme.text, fontSize: fontSize + 10 }}
//         >
//           {article.title}
//         </Text>

//         {/* Arabic Title */}
//         {article.titleArabic && (
//           <Text
//             className="text-xl mb-4 text-right"
//             style={{ color: theme.primary, fontSize: fontSize + 5 }}
//           >
//             {article.titleArabic}
//           </Text>
//         )}

//         {/* Reading Controls */}
//         <View
//           className="flex-row items-center justify-between p-3 rounded-xl mb-4"
//           style={{ backgroundColor: theme.card }}
//         >
//           <Text
//             className="text-xs font-semibold"
//             style={{ color: theme.textSecondary }}
//           >
//             Reading Options
//           </Text>
//           <View className="flex-row items-center space-x-2">
//             <TouchableOpacity
//               onPress={() => setFontSize(Math.max(12, fontSize - 1))}
//               className="w-8 h-8 rounded-full items-center justify-center"
//               style={{ backgroundColor: theme.background }}
//             >
//               <Text style={{ color: theme.text }}>A-</Text>
//             </TouchableOpacity>
//             <Text className="text-xs" style={{ color: theme.textSecondary }}>
//               {fontSize}
//             </Text>
//             <TouchableOpacity
//               onPress={() => setFontSize(Math.min(20, fontSize + 1))}
//               className="w-8 h-8 rounded-full items-center justify-center"
//               style={{ backgroundColor: theme.background }}
//             >
//               <Text style={{ color: theme.text }}>A+</Text>
//             </TouchableOpacity>

//             {article.arabicContent && (
//               <TouchableOpacity
//                 onPress={() => setShowArabic(!showArabic)}
//                 className="ml-2 px-3 py-1 rounded-full"
//                 style={{
//                   backgroundColor: showArabic
//                     ? theme.primary
//                     : theme.background,
//                 }}
//               >
//                 <Text
//                   className="text-xs font-semibold"
//                   style={{ color: showArabic ? "#fff" : theme.textSecondary }}
//                 >
//                   عربي
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>

//         {/* Summary */}
//         <View
//           className="p-4 rounded-xl mb-4"
//           style={{
//             backgroundColor: theme.primary + "15",
//             borderLeftWidth: 4,
//             borderLeftColor: theme.primary,
//           }}
//         >
//           <Text
//             className="font-semibold leading-6"
//             style={{ color: theme.text, fontSize }}
//           >
//             {article.summary}
//           </Text>
//         </View>

//         {/* Content */}
//         <View className="mb-4">
//           <Text
//             className="leading-7"
//             style={{ color: theme.text, fontSize, lineHeight: fontSize * 1.8 }}
//           >
//             {showArabic && article.arabicContent
//               ? article.arabicContent
//               : article.content}
//           </Text>
//         </View>

//         {/* References */}
//         {article.references.length > 0 && (
//           <View
//             className="rounded-xl border p-4 mb-4"
//             style={{
//               borderColor: theme.accentLight,
//               backgroundColor: theme.card,
//             }}
//           >
//             <View className="flex-row items-center mb-3">
//               <Ionicons
//                 name="library"
//                 size={18}
//                 color={theme.primary}
//                 style={{ marginRight: 6 }}
//               />
//               <Text className="font-bold" style={{ color: theme.text }}>
//                 References
//               </Text>
//             </View>
//             {article.references.map((ref, idx) => (
//               <View
//                 key={idx}
//                 className="mb-2 pb-2"
//                 style={{
//                   borderBottomWidth:
//                     idx < article.references.length - 1 ? 1 : 0,
//                   borderBottomColor: theme.accentLight,
//                 }}
//               >
//                 <View className="flex-row items-center mb-1">
//                   <View
//                     className="px-2 py-0.5 rounded mr-2"
//                     style={{
//                       backgroundColor:
//                         ref.type === "quran"
//                           ? "#10b981" + "20"
//                           : ref.type === "hadith"
//                             ? "#f59e0b" + "20"
//                             : theme.accentLight,
//                     }}
//                   >
//                     <Text
//                       className="text-[10px] font-bold"
//                       style={{
//                         color:
//                           ref.type === "quran"
//                             ? "#10b981"
//                             : ref.type === "hadith"
//                               ? "#f59e0b"
//                               : theme.textSecondary,
//                       }}
//                     >
//                       {ref.type.toUpperCase()}
//                     </Text>
//                   </View>
//                   <Text
//                     className="font-semibold flex-1"
//                     style={{ color: theme.text }}
//                   >
//                     {ref.source}
//                   </Text>
//                 </View>
//                 <Text
//                   className="text-xs"
//                   style={{ color: theme.textSecondary }}
//                 >
//                   {ref.citation}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         )}

//         {/* Tags */}
//         {article.tags.length > 0 && (
//           <View className="mb-4">
//             <Text
//               className="text-xs font-semibold mb-2"
//               style={{ color: theme.textSecondary }}
//             >
//               TAGS
//             </Text>
//             <View className="flex-row flex-wrap">
//               {article.tags.map((tag, idx) => (
//                 <View
//                   key={idx}
//                   className="px-3 py-1 rounded-full mr-2 mb-2"
//                   style={{ backgroundColor: theme.card }}
//                 >
//                   <Text
//                     className="text-xs"
//                     style={{ color: theme.textSecondary }}
//                   >
//                     #{tag}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           </View>
//         )}

//         {/* Related Articles */}
//         {relatedArticles.length > 0 && (
//           <View className="mb-4">
//             <Text
//               className="text-sm font-semibold mb-3"
//               style={{ color: theme.textSecondary }}
//             >
//               RELATED ARTICLES
//             </Text>
//             {relatedArticles.map((related) => (
//               <TouchableOpacity
//                 key={related.id}
//                 onPress={() => onOpenRelated(related)}
//                 className="rounded-xl border p-3 mb-2 flex-row items-center"
//                 style={{
//                   borderColor: theme.accentLight,
//                   backgroundColor: theme.card,
//                 }}
//               >
//                 <View className="flex-1">
//                   <Text
//                     className="font-semibold mb-1"
//                     style={{ color: theme.text }}
//                   >
//                     {related.title}
//                   </Text>
//                   <Text
//                     className="text-xs"
//                     style={{ color: theme.textSecondary }}
//                     numberOfLines={1}
//                   >
//                     {related.summary}
//                   </Text>
//                 </View>
//                 <Ionicons
//                   name="chevron-forward"
//                   size={20}
//                   color={theme.textSecondary}
//                 />
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         {/* Footer Info */}
//         <View
//           className="p-4 rounded-xl"
//           style={{ backgroundColor: theme.card }}
//         >
//           <View className="flex-row items-center justify-between">
//             <View className="flex-row items-center">
//               <Ionicons name="eye" size={14} color={theme.textSecondary} />
//               <Text
//                 className="text-xs ml-1"
//                 style={{ color: theme.textSecondary }}
//               >
//                 {article.views.toLocaleString()} views
//               </Text>
//             </View>
//             <Text className="text-xs" style={{ color: theme.textSecondary }}>
//               Updated {article.lastUpdated.toLocaleDateString()}
//             </Text>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default IslamicEncyclopedia;

// IslamicEncyclopedia.tsx
import ProgressBar from "@/components/pagePartials/prayerTimes/progressBar";
import { useTheme } from "@/hooks/useTheme";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Types
interface Article {
  id: string;
  title: string;
  arabicTitle?: string;
  category: Category;
  subcategory?: string;
  content: string;
  arabicContent?: string;
  references: string[];
  relatedArticles: string[];
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  readTime: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  isPremium: boolean;
  lastUpdated: Date;
  views: number;
  bookmarked?: boolean;
  readProgress?: number;
}

interface Category {
  id: string;
  name: string;
  arabicName: string;
  icon: string;
  iconType: "ionicon" | "material" | "font5";
  color: string;
  description: string;
  articleCount: number;
  subcategories?: string[];
}

// Sample Categories
const CATEGORIES: Category[] = [
  {
    id: "quran",
    name: "Quran",
    arabicName: "القرآن",
    icon: "book",
    iconType: "ionicon",
    color: "#10b981",
    description: "Verses, Tafsir, and Miracles",
    articleCount: 245,
    subcategories: ["Tafsir", "Verses", "Miracles", "Science"],
  },
  {
    id: "hadith",
    name: "Hadith",
    arabicName: "الحديث",
    icon: "mosque",
    iconType: "font5",
    color: "#3b82f6",
    description: "Prophetic traditions and explanations",
    articleCount: 189,
    subcategories: ["Bukhari", "Muslim", "Authentication", "Science"],
  },
  {
    id: "prophets",
    name: "Prophets",
    arabicName: "الأنبياء",
    icon: "star-and-crescent",
    iconType: "font5",
    color: "#8b5cf6",
    description: "Stories of all Prophets",
    articleCount: 125,
    subcategories: ["Stories", "Miracles", "Lessons"],
  },
  {
    id: "history",
    name: "Islamic History",
    arabicName: "التاريخ",
    icon: "history",
    iconType: "material",
    color: "#f59e0b",
    description: "Islamic civilization and heritage",
    articleCount: 312,
    subcategories: ["Caliphates", "Battles", "Scholars", "Golden Age"],
  },
  {
    id: "fiqh",
    name: "Fiqh",
    arabicName: "الفقه",
    icon: "scale-balance",
    iconType: "font5",
    color: "#06b6d4",
    description: "Islamic jurisprudence and rulings",
    articleCount: 278,
    subcategories: ["Worship", "Transactions", "Family", "Ethics"],
  },
  {
    id: "akhlaq",
    name: "Akhlaq",
    arabicName: "الأخلاق",
    icon: "hands-praying",
    iconType: "font5",
    color: "#ec4899",
    description: "Islamic ethics and character",
    articleCount: 156,
    subcategories: ["Character", "Manners", "Spirituality"],
  },
  {
    id: "science",
    name: "Science & Islam",
    arabicName: "العلم",
    icon: "atom",
    iconType: "material",
    color: "#14b8a6",
    description: "Scientific miracles and discoveries",
    articleCount: 98,
    subcategories: ["Miracles", "Scholars", "Medicine", "Astronomy"],
  },
  {
    id: "contemporary",
    name: "Contemporary",
    arabicName: "معاصر",
    icon: "earth",
    iconType: "ionicon",
    color: "#ef4444",
    description: "Modern issues and guidance",
    articleCount: 167,
    subcategories: ["Fatwa", "Issues", "Technology", "Finance"],
  },
];

// Sample Articles
const SAMPLE_ARTICLES: Article[] = [
  {
    id: "1",
    title: "The Night Journey (Isra and Mi'raj)",
    arabicTitle: "الإسراء والمعراج",
    category: CATEGORIES[2],
    subcategory: "Miracles",
    content:
      "The Isra and Mi'raj refers to the two parts of a miraculous night journey...",
    arabicContent: "الإسراء والمعراج رحلة معجزة...",
    references: ["Quran 17:1", "Sahih Bukhari 349", "Sahih Muslim 162"],
    relatedArticles: ["2", "3", "4"],
    audioUrl: "audio.mp3",
    imageUrl: "https://example.com/image.jpg",
    readTime: 12,
    difficulty: "intermediate",
    tags: ["miracle", "prophet", "journey", "prayer"],
    isPremium: false,
    lastUpdated: new Date(),
    views: 15420,
    readProgress: 35,
  },
  {
    id: "2",
    title: "The Five Pillars of Islam",
    arabicTitle: "أركان الإسلام الخمسة",
    category: CATEGORIES[4],
    subcategory: "Worship",
    content: "The Five Pillars of Islam are the foundation of Muslim life...",
    arabicContent: "أركان الإسلام الخمسة هي أساس الحياة الإسلامية...",
    references: ["Sahih Bukhari 8", "Sahih Muslim 16"],
    relatedArticles: ["1", "5"],
    readTime: 8,
    difficulty: "beginner",
    tags: ["pillars", "worship", "basics", "faith"],
    isPremium: false,
    lastUpdated: new Date(),
    views: 28340,
    bookmarked: true,
  },
  {
    id: "3",
    title: "The Golden Age of Islamic Science",
    arabicTitle: "العصر الذهبي للعلوم الإسلامية",
    category: CATEGORIES[6],
    subcategory: "Scholars",
    content: "During the Islamic Golden Age, scholars and polymaths...",
    references: ["The Canon of Medicine", "Kitab al-Jabr"],
    relatedArticles: ["4", "6"],
    readTime: 15,
    difficulty: "advanced",
    tags: ["science", "history", "scholars", "innovation"],
    isPremium: true,
    lastUpdated: new Date(),
    views: 9850,
  },
];

const IslamicEncyclopedia = () => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>(SAMPLE_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [readingHistory, setReadingHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "explore" | "bookmarks" | "history"
  >("explore");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load bookmarks and history
    loadUserData();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadUserData = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem("encyclopediaBookmarks");
      const history = await AsyncStorage.getItem("encyclopediaHistory");

      if (bookmarks) setBookmarkedIds(new Set(JSON.parse(bookmarks)));
      if (history) setReadingHistory(JSON.parse(history));
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const toggleBookmark = async (articleId: string) => {
    const newBookmarks = new Set(bookmarkedIds);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
    } else {
      newBookmarks.add(articleId);
    }
    setBookmarkedIds(newBookmarks);
    await AsyncStorage.setItem(
      "encyclopediaBookmarks",
      JSON.stringify(Array.from(newBookmarks))
    );
  };

  const addToHistory = async (articleId: string) => {
    const newHistory = [
      articleId,
      ...readingHistory.filter((id) => id !== articleId),
    ].slice(0, 20);
    setReadingHistory(newHistory);
    await AsyncStorage.setItem(
      "encyclopediaHistory",
      JSON.stringify(newHistory)
    );
  };

  const handleSearch = () => {
    setIsSearching(true);
    Animated.timing(searchAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Simulate search
    setTimeout(() => {
      setIsSearching(false);
      // Filter articles based on search
    }, 1000);
  };

  return (
    <Animated.View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          className="rounded-2xl border p-5 mb-4"
          style={{
            borderColor: theme.accentLight ?? "#ffffff22",
            backgroundColor: theme.card,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text
                className="text-2xl font-bold"
                style={{ color: theme.text }}
              >
                Islamic Encyclopedia
              </Text>
              <Text
                className="text-sm mt-1"
                style={{ color: theme.textSecondary }}
              >
                Comprehensive Islamic knowledge base
              </Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="w-10 h-10 rounded-full items-center justify-center mr-2"
                style={{
                  backgroundColor: theme.primaryLight ?? theme.primary + "20",
                }}
              >
                <Ionicons name="stats-chart" size={18} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: theme.primaryLight ?? theme.primary + "20",
                }}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View
            className="flex-row items-center px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: theme.background }}
          >
            <Ionicons name="search" size={20} color={theme.textSecondary} />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Search topics, verses, or keywords..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ color: theme.text, fontSize: 14 }}
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Stats */}
          <View className="flex-row justify-around">
            <QuickStat
              icon="book-outline"
              value="2,450+"
              label="Articles"
              color={theme.primary}
              theme={theme}
            />
            <QuickStat
              icon="bookmark"
              value={bookmarkedIds.size.toString()}
              label="Bookmarks"
              color="#f59e0b"
              theme={theme}
            />
            <QuickStat
              icon="time-outline"
              value={readingHistory.length.toString()}
              label="History"
              color="#8b5cf6"
              theme={theme}
            />
            <QuickStat
              icon="trophy"
              value="12"
              label="Completed"
              color="#10b981"
              theme={theme}
            />
          </View>
        </View>

        {/* Navigation Tabs */}
        <View className="flex-row mb-4">
          {(["explore", "bookmarks", "history"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 py-3 items-center"
              style={{
                borderBottomWidth: 2,
                borderBottomColor:
                  activeTab === tab ? theme.primary : "transparent",
              }}
            >
              <Text
                className="font-semibold capitalize"
                style={{
                  color:
                    activeTab === tab ? theme.primary : theme.textSecondary,
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "explore" && (
          <>
            {/* Categories Grid */}
            <Text
              className="text-lg font-bold mb-3"
              style={{ color: theme.text }}
            >
              Browse Categories
            </Text>
            <View className="flex-row flex-wrap mb-6">
              {CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  theme={theme}
                  onPress={() => setSelectedCategory(category)}
                  isSelected={selectedCategory?.id === category.id}
                />
              ))}
            </View>

            {/* Featured Articles */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="text-lg font-bold"
                  style={{ color: theme.text }}
                >
                  Featured Articles
                </Text>
                <TouchableOpacity className="flex-row items-center">
                  <Text
                    className="text-sm mr-1"
                    style={{ color: theme.primary }}
                  >
                    View all
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {articles.map((article) => (
                  <FeaturedArticleCard
                    key={article.id}
                    article={article}
                    theme={theme}
                    onPress={() => {
                      setSelectedArticle(article);
                      setShowArticleModal(true);
                      addToHistory(article.id);
                    }}
                    isBookmarked={bookmarkedIds.has(article.id)}
                    onToggleBookmark={() => toggleBookmark(article.id)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Topic Collections */}
            <View className="mb-6">
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: theme.text }}
              >
                Popular Collections
              </Text>
              <CollectionCard
                title="99 Names of Allah"
                arabicTitle="أسماء الله الحسنى"
                description="Explore the beautiful names and attributes"
                icon="star-and-crescent"
                color="#10b981"
                articleCount={99}
                progress={45}
                theme={theme}
                isPremium={false}
              />
              <CollectionCard
                title="Stories of the Prophets"
                arabicTitle="قصص الأنبياء"
                description="Complete narratives of all Prophets"
                icon="book-quran"
                color="#3b82f6"
                articleCount={25}
                progress={20}
                theme={theme}
                isPremium={false}
              />
              <CollectionCard
                title="Quranic Sciences"
                arabicTitle="علوم القرآن"
                description="Deep dive into Tafsir and interpretations"
                icon="mosque"
                color="#8b5cf6"
                articleCount={150}
                progress={10}
                theme={theme}
                isPremium={true}
              />
            </View>
          </>
        )}

        {activeTab === "bookmarks" && (
          <BookmarksTab
            articles={articles.filter((a) => bookmarkedIds.has(a.id))}
            theme={theme}
            onArticlePress={(article) => {
              setSelectedArticle(article);
              setShowArticleModal(true);
            }}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {activeTab === "history" && (
          <HistoryTab
            articles={
              readingHistory
                .map((id) => articles.find((a) => a.id === id))
                .filter(Boolean) as Article[]
            }
            theme={theme}
            onArticlePress={(article) => {
              setSelectedArticle(article);
              setShowArticleModal(true);
            }}
            onClearHistory={() => {
              setReadingHistory([]);
              AsyncStorage.removeItem("encyclopediaHistory");
            }}
          />
        )}
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal
        visible={showArticleModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowArticleModal(false)}
      >
        {selectedArticle && (
          <ArticleDetailModal
            article={selectedArticle}
            theme={theme}
            onClose={() => setShowArticleModal(false)}
            isBookmarked={bookmarkedIds.has(selectedArticle.id)}
            onToggleBookmark={() => toggleBookmark(selectedArticle.id)}
          />
        )}
      </Modal>
    </Animated.View>
  );
};

// Category Card Component
const CategoryCard = ({
  category,
  theme,
  onPress,
  isSelected,
}: {
  category: Category;
  theme: any;
  onPress: () => void;
  isSelected: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const getIcon = () => {
    switch (category.iconType) {
      case "material":
        return (
          <MaterialCommunityIcons
            name={category.icon as any}
            size={24}
            color="#fff"
          />
        );
      case "font5":
        return (
          <FontAwesome5 name={category.icon as any} size={20} color="#fff" />
        );
      default:
        return <Ionicons name={category.icon as any} size={24} color="#fff" />;
    }
  };

  return (
    <Pressable onPress={handlePress} className="w-1/2 p-2">
      <Animated.View
        className="rounded-xl p-4"
        style={{
          backgroundColor: category.color,
          transform: [{ scale: scaleAnim }],
          opacity: isSelected ? 1 : 0.9,
          elevation: isSelected ? 8 : 4,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            {getIcon()}
          </View>
          <Text className="text-white text-xs font-semibold">
            {category.articleCount}
          </Text>
        </View>
        <Text className="text-white font-bold text-base mb-1">
          {category.name}
        </Text>
        <Text className="text-white/80 text-xs">{category.arabicName}</Text>
      </Animated.View>
    </Pressable>
  );
};

// Featured Article Card
const FeaturedArticleCard = ({
  article,
  theme,
  onPress,
  isBookmarked,
  onToggleBookmark,
}: {
  article: Article;
  theme: any;
  onPress: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="mr-3"
    style={{ width: SCREEN_WIDTH * 0.75 }}
  >
    <View
      className="rounded-2xl p-4"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.accentLight,
        elevation: 4,
      }}
    >
      {article.isPremium && (
        <View
          className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full"
          style={{ backgroundColor: "#fbbf24" }}
        >
          <Text className="text-[10px] font-bold text-white">PRO</Text>
        </View>
      )}

      <View className="flex-row items-start mb-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: article.category.color + "20" }}
        >
          <Ionicons
            name={article.category.icon as any}
            size={20}
            color={article.category.color}
          />
        </View>
        <View className="flex-1">
          <Text
            className="font-bold text-base mb-1"
            style={{ color: theme.text }}
          >
            {article.title}
          </Text>
          {article.arabicTitle && (
            <Text
              className="text-sm mb-2"
              style={{ color: theme.textSecondary }}
            >
              {article.arabicTitle}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onToggleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isBookmarked ? theme.primary : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
          <Text className="text-xs ml-1" style={{ color: theme.textSecondary }}>
            {article.readTime} min
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="eye-outline" size={14} color={theme.textSecondary} />
          <Text className="text-xs ml-1" style={{ color: theme.textSecondary }}>
            {article.views.toLocaleString()}
          </Text>
        </View>
        <View
          className="px-2 py-1 rounded"
          style={{
            backgroundColor:
              article.difficulty === "beginner"
                ? "#10b981"
                : article.difficulty === "intermediate"
                  ? "#f59e0b"
                  : "#ef4444",
          }}
        >
          <Text className="text-[10px] font-semibold text-white capitalize">
            {article.difficulty}
          </Text>
        </View>
      </View>

      {article.readProgress && article.readProgress > 0 && (
        <View>
          <View className="flex-row justify-between mb-1">
            <Text
              className="text-[10px]"
              style={{ color: theme.textSecondary }}
            >
              Reading Progress
            </Text>
            <Text
              className="text-[10px] font-bold"
              style={{ color: theme.primary }}
            >
              {article.readProgress}%
            </Text>
          </View>
          <ProgressBar
            trackColor={theme.accentLight}
            fillColor={theme.primary}
            pct={article.readProgress}
          />
        </View>
      )}

      <View className="flex-row flex-wrap mt-3">
        {article.tags.slice(0, 3).map((tag, idx) => (
          <View
            key={idx}
            className="mr-2 mb-2 px-2 py-1 rounded"
            style={{ backgroundColor: theme.background }}
          >
            <Text
              className="text-[10px]"
              style={{ color: theme.textSecondary }}
            >
              #{tag}
            </Text>
          </View>
        ))}
      </View>
    </View>
  </Pressable>
);

// Collection Card
const CollectionCard = ({
  title,
  arabicTitle,
  description,
  icon,
  color,
  articleCount,
  progress,
  theme,
  isPremium,
}: {
  title: string;
  arabicTitle: string;
  description: string;
  icon: string;
  color: string;
  articleCount: number;
  progress: number;
  theme: any;
  isPremium: boolean;
}) => (
  <TouchableOpacity
    className="rounded-2xl p-4 mb-3"
    style={{
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.accentLight,
    }}
  >
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center flex-1">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: color + "20" }}
        >
          <FontAwesome5 name={icon} size={20} color={color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-bold text-base" style={{ color: theme.text }}>
              {title}
            </Text>
            {isPremium && (
              <View
                className="ml-2 px-2 py-0.5 rounded"
                style={{ backgroundColor: "#fbbf24" }}
              >
                <Text className="text-[10px] font-bold text-white">PRO</Text>
              </View>
            )}
          </View>
          <Text className="text-sm" style={{ color: theme.textSecondary }}>
            {arabicTitle}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </View>

    <Text className="text-xs mb-3" style={{ color: theme.textSecondary }}>
      {description}
    </Text>

    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-xs" style={{ color: theme.textSecondary }}>
        {articleCount} articles • {Math.round((progress * articleCount) / 100)}{" "}
        completed
      </Text>
      <Text className="text-xs font-bold" style={{ color: color }}>
        {progress}%
      </Text>
    </View>
    <ProgressBar
      trackColor={theme.accentLight}
      fillColor={color}
      pct={progress}
    />
  </TouchableOpacity>
);

// Article Detail Modal
const ArticleDetailModal = ({
  article,
  theme,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: {
  article: Article;
  theme: any;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}) => {
  const [fontSize, setFontSize] = useState(16);
  const [showArabic, setShowArabic] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View
        className="px-4 pt-12 pb-4"
        style={{
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.accentLight,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.background }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View className="flex-row items-center">
            {article.audioUrl && (
              <TouchableOpacity
                onPress={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: theme.primary }}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onToggleBookmark}
              className="w-10 h-10 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: theme.background }}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isBookmarked ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.background }}
            >
              <Ionicons name="share-social" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
          {article.title}
        </Text>
        {article.arabicTitle && (
          <Text className="text-lg mb-3" style={{ color: theme.textSecondary }}>
            {article.arabicTitle}
          </Text>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="px-3 py-1 rounded-full mr-2"
              style={{ backgroundColor: article.category.color + "20" }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: article.category.color }}
              >
                {article.category.name}
              </Text>
            </View>
            {article.subcategory && (
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: theme.background }}
              >
                <Text
                  className="text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  {article.subcategory}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center">
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.textSecondary}
            />
            <Text
              className="text-xs ml-1"
              style={{ color: theme.textSecondary }}
            >
              {article.readTime} min read
            </Text>
          </View>
        </View>
      </View>

      {/* Content Controls */}
      <View
        className="px-4 py-3 flex-row items-center justify-between"
        style={{
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.accentLight,
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            className="w-8 h-8 rounded items-center justify-center mr-2"
            style={{ backgroundColor: theme.background }}
          >
            <Text style={{ color: theme.text, fontSize: 12 }}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFontSize(Math.min(24, fontSize + 2))}
            className="w-8 h-8 rounded items-center justify-center mr-3"
            style={{ backgroundColor: theme.background }}
          >
            <Text style={{ color: theme.text, fontSize: 16 }}>A+</Text>
          </TouchableOpacity>
          <View
            className="h-6 w-px"
            style={{ backgroundColor: theme.accentLight }}
          />
          <TouchableOpacity
            onPress={() => setShowArabic(!showArabic)}
            className="ml-3 px-3 py-1 rounded"
            style={{
              backgroundColor: showArabic ? theme.primary : theme.background,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: showArabic ? "#fff" : theme.text }}
            >
              عربي
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="eye-outline" size={16} color={theme.textSecondary} />
          <Text className="text-xs ml-1" style={{ color: theme.textSecondary }}>
            {article.views.toLocaleString()} views
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-4">
        {article.imageUrl && (
          <View
            className="rounded-xl overflow-hidden mb-4"
            style={{
              height: 200,
              backgroundColor: theme.card,
            }}
          >
            {/* Placeholder for image */}
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image" size={50} color={theme.textSecondary} />
            </View>
          </View>
        )}

        <Text
          className="leading-7 mb-4"
          style={{ color: theme.text, fontSize }}
        >
          {showArabic && article.arabicContent
            ? article.arabicContent
            : article.content}
        </Text>

        {/* References */}
        {article.references.length > 0 && (
          <View
            className="rounded-xl p-4 mb-4"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.accentLight,
            }}
          >
            <Text className="font-bold mb-3" style={{ color: theme.text }}>
              References
            </Text>
            {article.references.map((ref, idx) => (
              <View key={idx} className="flex-row items-start mb-2">
                <Text className="mr-2" style={{ color: theme.primary }}>
                  {idx + 1}.
                </Text>
                <Text
                  className="flex-1 text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  {ref}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Related Articles */}
        {article.relatedArticles.length > 0 && (
          <View className="mb-4">
            <Text className="font-bold mb-3" style={{ color: theme.text }}>
              Related Articles
            </Text>
            {SAMPLE_ARTICLES.filter((a) =>
              article.relatedArticles.includes(a.id)
            ).map((related) => (
              <TouchableOpacity
                key={related.id}
                className="rounded-xl border p-3 mb-2 flex-row items-center"
                style={{
                  borderColor: theme.accentLight,
                  backgroundColor: theme.card,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: related.category.color + "20" }}
                >
                  <Ionicons
                    name={related.category.icon as any}
                    size={20}
                    color={related.category.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: theme.text }}>
                    {related.title}
                  </Text>
                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: theme.textSecondary }}
                  >
                    {related.readTime} min • {related.category.name}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tags */}
        <View className="flex-row flex-wrap mb-6">
          {article.tags.map((tag, idx) => (
            <TouchableOpacity
              key={idx}
              className="mr-2 mb-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: theme.card }}
            >
              <Text className="text-sm" style={{ color: theme.textSecondary }}>
                #{tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Quick Stat Component
const QuickStat = ({
  icon,
  value,
  label,
  color,
  theme,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
  theme: any;
}) => (
  <View className="items-center">
    <View
      className="w-10 h-10 rounded-full items-center justify-center mb-1"
      style={{ backgroundColor: color + "20" }}
    >
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <Text className="text-base font-bold" style={{ color: theme.text }}>
      {value}
    </Text>
    <Text className="text-xs" style={{ color: theme.textSecondary }}>
      {label}
    </Text>
  </View>
);

// Bookmarks Tab
const BookmarksTab = ({
  articles,
  theme,
  onArticlePress,
  onToggleBookmark,
}: {
  articles: Article[];
  theme: any;
  onArticlePress: (article: Article) => void;
  onToggleBookmark: (id: string) => void;
}) => (
  <View className="flex-1">
    {articles.length === 0 ? (
      <View className="items-center py-12">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: theme.card }}
        >
          <Ionicons
            name="bookmark-outline"
            size={40}
            color={theme.textSecondary}
          />
        </View>
        <Text className="text-lg font-bold mb-2" style={{ color: theme.text }}>
          No Bookmarks Yet
        </Text>
        <Text
          className="text-sm text-center"
          style={{ color: theme.textSecondary }}
        >
          Articles you bookmark will appear here
        </Text>
      </View>
    ) : (
      <View>
        <Text
          className="text-sm font-semibold mb-3"
          style={{ color: theme.textSecondary }}
        >
          {articles.length} BOOKMARKED ARTICLES
        </Text>
        {articles.map((article) => (
          <ArticleListItem
            key={article.id}
            article={article}
            theme={theme}
            onPress={() => onArticlePress(article)}
            onToggleBookmark={() => onToggleBookmark(article.id)}
            isBookmarked={true}
          />
        ))}
      </View>
    )}
  </View>
);

// History Tab
const HistoryTab = ({
  articles,
  theme,
  onArticlePress,
  onClearHistory,
}: {
  articles: Article[];
  theme: any;
  onArticlePress: (article: Article) => void;
  onClearHistory: () => void;
}) => (
  <View className="flex-1">
    {articles.length === 0 ? (
      <View className="items-center py-12">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: theme.card }}
        >
          <Ionicons name="time-outline" size={40} color={theme.textSecondary} />
        </View>
        <Text className="text-lg font-bold mb-2" style={{ color: theme.text }}>
          No History
        </Text>
        <Text
          className="text-sm text-center"
          style={{ color: theme.textSecondary }}
        >
          Articles you read will appear here
        </Text>
      </View>
    ) : (
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text
            className="text-sm font-semibold"
            style={{ color: theme.textSecondary }}
          >
            RECENTLY READ
          </Text>
          <TouchableOpacity onPress={onClearHistory}>
            <Text className="text-sm" style={{ color: theme.primary }}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
        {articles.map((article) => (
          <ArticleListItem
            key={article.id}
            article={article}
            theme={theme}
            onPress={() => onArticlePress(article)}
            isBookmarked={false}
          />
        ))}
      </View>
    )}
  </View>
);

// Article List Item
const ArticleListItem = ({
  article,
  theme,
  onPress,
  onToggleBookmark,
  isBookmarked,
}: {
  article: Article;
  theme: any;
  onPress: () => void;
  onToggleBookmark?: () => void;
  isBookmarked: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="rounded-xl border p-3 mb-2 flex-row items-center"
    style={{
      borderColor: theme.accentLight,
      backgroundColor: theme.card,
    }}
  >
    <View
      className="w-12 h-12 rounded-full items-center justify-center mr-3"
      style={{ backgroundColor: article.category.color + "20" }}
    >
      <Ionicons
        name={article.category.icon as any}
        size={24}
        color={article.category.color}
      />
    </View>
    <View className="flex-1">
      <Text className="font-semibold mb-1" style={{ color: theme.text }}>
        {article.title}
      </Text>
      <View className="flex-row items-center">
        <Text className="text-xs" style={{ color: theme.textSecondary }}>
          {article.category.name}
        </Text>
        <Text className="text-xs mx-2" style={{ color: theme.textSecondary }}>
          •
        </Text>
        <Text className="text-xs" style={{ color: theme.textSecondary }}>
          {article.readTime} min
        </Text>
        {article.readProgress && article.readProgress > 0 && (
          <>
            <Text
              className="text-xs mx-2"
              style={{ color: theme.textSecondary }}
            >
              •
            </Text>
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.primary }}
            >
              {article.readProgress}% read
            </Text>
          </>
        )}
      </View>
    </View>
    {onToggleBookmark && (
      <TouchableOpacity onPress={onToggleBookmark}>
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={20}
          color={isBookmarked ? theme.primary : theme.textSecondary}
        />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

export default IslamicEncyclopedia;
