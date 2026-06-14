"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Plus,
  Lightbulb,
  Target,
  FileText,
  History,
  ClipboardCheck,
  Tag,
  User,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockKnowledgeBase } from "@/lib/mock-data";
import { getInitials, formatDate } from "@/lib/utils";
import { AddKnowledgeDialog } from "@/components/knowledge/add-knowledge-dialog";

const categories = [
  { id: "ALL", label: "Semua", icon: BookOpen },
  { id: "TIPS", label: "Tips", icon: Lightbulb },
  { id: "STRATEGY", label: "Strategi", icon: Target },
  { id: "TEMPLATE", label: "Template", icon: FileText },
  { id: "LESSONS_LEARNED", label: "Lessons", icon: History },
  { id: "EVALUATION", label: "Evaluasi", icon: ClipboardCheck },
];

const categoryColors: Record<string, string> = {
  TIPS: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  STRATEGY: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  TEMPLATE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  LESSONS_LEARNED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  EVALUATION: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  GENERAL: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [articles, setArticles] = useState(mockKnowledgeBase);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "ALL" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Pengetahuan, tips, dan pengalaman dari kompetisi yang telah dilalui
          </p>
        </div>
        <AddKnowledgeDialog onAdd={(newArticle) => {
          mockKnowledgeBase.unshift(newArticle);
          setArticles([newArticle, ...articles]);
        }} />
      </div>

      {/* AI Search Banner */}
      <Card className="border-cygnus-primary/30 bg-gradient-to-r from-cygnus-primary/5 to-cygnus-accent/5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-cygnus-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-cygnus-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">AI Semantic Search</p>
            <p className="text-xs text-muted-foreground">
              Cari artikel dengan bahasa natural. AI akan memahami konteks pertanyaan Anda.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari tips, strategi, template..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5 text-xs">
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Articles Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredArticles.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Card className="group hover:shadow-xl transition-all cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={cn("text-[10px]", categoryColors[article.category])}>
                    {article.category.replace("_", " ")}
                  </Badge>
                  {article.isTemplate && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <FileText className="h-3 w-3" />
                      Template
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {article.content}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] gap-1">
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[8px] bg-gradient-to-br from-cygnus-primary/80 to-cygnus-accent/80 text-white">
                        {getInitials(article.author.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{article.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(article.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">Tidak ada artikel ditemukan</h3>
          <p className="text-muted-foreground mt-1">Coba ubah kata kunci atau kategori</p>
        </div>
      )}
    </motion.div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
