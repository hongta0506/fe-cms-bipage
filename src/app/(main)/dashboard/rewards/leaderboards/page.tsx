"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Award,
  ChevronRight,
  Flame,
  Loader2,
  Medal,
  RefreshCw,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardRecord {
  username: string;
  score: number;
  rank: number;
  numScore: number;
  updatedAt: number;
}

interface LeaderboardData {
  contractVersion: string;
  topPoints: LeaderboardRecord[];
  topSpins: LeaderboardRecord[];
}

export default function LeaderboardsPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [tab, setTab] = useState<"points" | "spins">("points");
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rewards/leaderboards");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể tải bảng xếp hạng");
      setData(json);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeaderboard();
  }, []);

  const activeRecords = tab === "points" ? data?.topPoints ?? [] : data?.topSpins ?? [];
  const top1 = activeRecords[0];
  const top2 = activeRecords[1];
  const top3 = activeRecords[2];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <ChevronRight className="size-4" />
            <span>Vòng quay & Thưởng</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
            <Trophy className="size-7 text-amber-500" />
            Bảng Xếp Hạng Nakama Realtime
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi trực tiếp thứ hạng người chơi xuất sắc nhất trên Nakama Game Server theo điểm tích lũy và lượt quay.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchLeaderboard} className="gap-2">
          <RefreshCw className="size-4" />
          Làm mới
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(val) => setTab(val as "points" | "spins")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="points" className="gap-2">
            <Flame className="size-4 text-amber-500" /> Top Điểm Thưởng
          </TabsTrigger>
          <TabsTrigger value="spins" className="gap-2">
            <Zap className="size-4 text-blue-500" /> Top Lượt Quay
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Top 3 Podium Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Top 2 */}
        <Card className="relative overflow-hidden border-slate-300 dark:border-slate-700 order-2 md:order-1">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Medal className="size-20 text-slate-400" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                #2 Hạng Nhì
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold mt-2 truncate">
              {top2 ? top2.username : "Chưa có"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600 dark:text-slate-300 font-mono">
              {top2 ? `${top2.score.toLocaleString()} ${tab === "points" ? "pts" : "lượt"}` : "—"}
            </div>
          </CardContent>
        </Card>

        {/* Top 1 */}
        <Card className="relative overflow-hidden border-amber-400 dark:border-amber-600 bg-amber-50/20 dark:bg-amber-950/10 order-1 md:order-2 shadow-md">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Trophy className="size-24 text-amber-500" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Badge className="font-bold bg-amber-500 text-white hover:bg-amber-600">
                👑 #1 Quán Quân
              </Badge>
            </div>
            <CardTitle className="text-2xl font-extrabold mt-2 text-amber-700 dark:text-amber-400 truncate">
              {top1 ? top1.username : "Chưa có"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {top1 ? `${top1.score.toLocaleString()} ${tab === "points" ? "pts" : "lượt"}` : "—"}
            </div>
          </CardContent>
        </Card>

        {/* Top 3 */}
        <Card className="relative overflow-hidden border-amber-800/40 dark:border-amber-800 order-3">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Medal className="size-20 text-amber-800" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-bold border-amber-700 text-amber-800 dark:text-amber-300">
                #3 Hạng Ba
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold mt-2 truncate">
              {top3 ? top3.username : "Chưa có"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-500 font-mono">
              {top3 ? `${top3.score.toLocaleString()} ${tab === "points" ? "pts" : "lượt"}` : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Bảng Xếp Hạng Đầy Đủ</CardTitle>
          <CardDescription>
            Cập nhật tự động dựa trên giao dịch trúng thưởng và hoàn thành nhiệm vụ từ máy chủ Nakama.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeRecords.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-lg">
              Chưa có dữ liệu bảng xếp hạng.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Hạng</TableHead>
                    <TableHead>Người chơi</TableHead>
                    <TableHead className="text-right">
                      {tab === "points" ? "Tổng điểm tích lũy" : "Tổng lượt quay"}
                    </TableHead>
                    <TableHead className="text-center">Số lần ghi nhận</TableHead>
                    <TableHead className="text-right">Cập nhật cuối</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRecords.map((r) => {
                    let rankBadge = <span className="font-mono text-sm">{r.rank}</span>;
                    if (r.rank === 1) {
                      rankBadge = (
                        <span className="size-6 rounded-full bg-amber-500 text-white font-bold text-xs inline-flex items-center justify-center">
                          1
                        </span>
                      );
                    } else if (r.rank === 2) {
                      rankBadge = (
                        <span className="size-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs inline-flex items-center justify-center">
                          2
                        </span>
                      );
                    } else if (r.rank === 3) {
                      rankBadge = (
                        <span className="size-6 rounded-full bg-amber-700 text-white font-bold text-xs inline-flex items-center justify-center">
                          3
                        </span>
                      );
                    }

                    return (
                      <TableRow key={r.rank}>
                        <TableCell className="text-center">{rankBadge}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                              <User className="size-3.5" />
                            </div>
                            <span className="font-medium text-sm">{r.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-base">
                          {tab === "points" ? (
                            <span className="text-amber-600 dark:text-amber-400">
                              {r.score.toLocaleString()} pts
                            </span>
                          ) : (
                            <span className="text-blue-600 dark:text-blue-400">
                              {r.score.toLocaleString()} lượt
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {r.numScore}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(r.updatedAt * 1000).toLocaleString("vi-VN")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
