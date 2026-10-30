"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Dices,
  Gift,
  Loader2,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminSpinRecord {
  postingId: string;
  playerId: string;
  amount: number;
  metadata: {
    prizeId?: string;
    prizeName?: string;
    tierId?: string;
    spinCost?: number;
    pointsAwarded?: number;
  };
  createdAt: number;
}

export default function SpinsHistoryPage() {
  const [spins, setSpins] = useState<AdminSpinRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 30;

  const fetchSpins = async (newOffset = offset) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rewards/spins?limit=${limit}&offset=${newOffset}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể tải nhật ký quay thưởng");
      setSpins(json.spins || []);
      setTotal(json.total || 0);
      setOffset(newOffset);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSpins(0);
  }, []);

  const totalPointsDistributed = spins.reduce((sum, s) => sum + (s.amount || 0), 0);

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
            <Dices className="size-7 text-primary" />
            Nhật ký Quay thưởng Nakama
          </h1>
          <p className="text-sm text-muted-foreground">
            Toàn bộ lịch sử các lượt quay số may mắn thời gian thực ghi nhận từ Nakama Game Engine.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => void fetchSpins(offset)} className="gap-2">
          <RefreshCw className="size-4" />
          Làm mới
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng lượt quay toàn hệ thống</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {total.toLocaleString()} lượt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Ghi nhận liên tục từ sự kiện người dùng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Điểm thưởng trang hiện tại</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +{totalPointsDistributed.toLocaleString()} pts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tổng điểm trúng thưởng hiển thị trên bảng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trạng thái kết nối Nakama</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Sparkles className="size-5" /> Trực tuyến
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Đồng bộ qua internal RPC bridge</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách lượt quay</CardTitle>
            <CardDescription>
              Hiển thị từ {offset + 1} đến {Math.min(offset + limit, total)} trên tổng số {total} lượt.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset <= 0 || loading}
              onClick={() => void fetchSpins(Math.max(0, offset - limit))}
            >
              <ChevronLeft className="size-4" /> Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= total || loading}
              onClick={() => void fetchSpins(offset + limit)}
            >
              Sau <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : spins.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-lg">
              Chưa có dữ liệu quay thưởng nào.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Người chơi (Player ID)</TableHead>
                    <TableHead>Bậc thưởng</TableHead>
                    <TableHead className="text-right">Chi phí</TableHead>
                    <TableHead>Phần thưởng trúng</TableHead>
                    <TableHead className="text-right">Điểm cộng</TableHead>
                    <TableHead className="font-mono text-xs">Posting ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spins.map((s) => {
                    const meta = s.metadata || {};
                    return (
                      <TableRow key={s.postingId}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(s.createdAt).toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-medium">
                          {s.playerId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {meta.tierId || "bronze"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {meta.spinCost ? `${meta.spinCost} pts` : "Miễn phí"}
                        </TableCell>
                        <TableCell className="font-medium flex items-center gap-1.5">
                          {s.amount > 0 ? (
                            <Trophy className="size-3.5 text-amber-500" />
                          ) : (
                            <Gift className="size-3.5 text-blue-500" />
                          )}
                          <span>{meta.prizeName || "Giải thưởng"}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold whitespace-nowrap">
                          {s.amount > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">+{s.amount} pts</span>
                          ) : (
                            <span className="text-muted-foreground">0 pts</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                          {s.postingId}
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
