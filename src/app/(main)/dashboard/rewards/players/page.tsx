"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronRight,
  CreditCard,
  History,
  Loader2,
  RefreshCw,
  Search,
  Sliders,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UserItem {
  id: number;
  username?: string;
  email?: string;
  created_at?: string;
}

interface PlayerDetail {
  contractVersion: string;
  playerId: string;
  balance: number;
  version: number;
  referralCode: string;
  recentLedger: Array<{
    postingId: string;
    amount: number;
    balanceAfter: number;
    postingType: string;
    sourceReference: string;
    metadata: string;
    createdAt: string;
  }>;
}

export default function PlayersRewardPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [playerDetail, setPlayerDetail] = useState<PlayerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Adjust dialog
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustPending, setAdjustPending] = useState(false);

  const fetchUsers = async (query = "") => {
    try {
      setLoadingUsers(true);
      const url = query
        ? `/api/content/user?limit=20&search=${encodeURIComponent(query)}`
        : `/api/content/user?limit=20`;
      const res = await fetch(url);
      const json = await res.json();
      const list = json?.data ?? [];
      setUsers(list);
      if (list.length > 0 && !selectedUser) {
        void handleSelectUser(list[0]);
      }
    } catch {
      toast.error("Không thể tải danh sách người chơi");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      void fetchUsers(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleSelectUser = async (user: UserItem) => {
    setSelectedUser(user);
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/rewards/players/${user.id}`);
      if (!res.ok) {
        setPlayerDetail(null);
        return;
      }
      const data = await res.json();
      setPlayerDetail(data);
    } catch {
      setPlayerDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (adjustAmount === 0) {
      toast.error("Số điểm điều chỉnh không thể bằng 0");
      return;
    }
    if (!adjustReason.trim()) {
      toast.error("Vui lòng nhập lý do điều chỉnh để lưu audit log");
      return;
    }

    try {
      setAdjustPending(true);
      const res = await fetch(`/api/rewards/players/${selectedUser.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(adjustAmount), reason: adjustReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể điều chỉnh điểm");

      toast.success(`Điều chỉnh điểm thành công! Số dư mới: ${json.newBalance} pts`);
      setIsAdjustOpen(false);
      setAdjustReason("");
      // Refresh detail
      await handleSelectUser(selectedUser);
    } catch (err: any) {
      toast.error(err.message || "Lỗi xử lý");
    } finally {
      setAdjustPending(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <ChevronRight className="size-4" />
          <span>Vòng quay & Thưởng</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
          <Users className="size-7 text-primary" />
          Người chơi & Điểm Thưởng Nakama
        </h1>
        <p className="text-sm text-muted-foreground">
          Tra cứu số dư, lịch sử biến động điểm ledger từ Nakama và công cụ điều chỉnh điểm cộng/trừ an toàn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Search & List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Danh sách Người chơi</span>
              <Button size="icon" variant="ghost" className="size-7" onClick={() => void fetchUsers(search)}>
                <RefreshCw className="size-3.5" />
              </Button>
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm username / email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingUsers ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center p-6 text-sm text-muted-foreground">Không tìm thấy người chơi</div>
            ) : (
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {users.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => void handleSelectUser(u)}
                      className={`w-full text-left p-3.5 transition-colors flex items-center justify-between hover:bg-muted/50 ${
                        isSelected ? "bg-muted font-medium" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <User className="size-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-medium truncate">{u.username || `User #${u.id}`}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.email || "No email"}</div>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Selected Player Detail & Nakama Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {selectedUser ? (
            <>
              {/* Profile Overview Card */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{selectedUser.username || `User #${selectedUser.id}`}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        ID: {selectedUser.id}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{selectedUser.email}</CardDescription>
                  </div>
                  <Button onClick={() => setIsAdjustOpen(true)} className="gap-2">
                    <Sliders className="size-4" />
                    Điều chỉnh điểm
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-3 bg-muted/40 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Số dư khả dụng (Nakama)</div>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                        {loadingDetail ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          `${playerDetail?.balance?.toLocaleString() ?? 0} pts`
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Mã giới thiệu (Referral)</div>
                      <div className="text-lg font-mono font-bold mt-1 text-primary">
                        {loadingDetail ? "..." : playerDetail?.referralCode || "Chưa tạo"}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Account Ledger Version</div>
                      <div className="text-lg font-mono font-semibold mt-1">
                        {loadingDetail ? "..." : `v${playerDetail?.version ?? 0}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nakama Ledger History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="size-4 text-primary" />
                    Lịch sử Biến động Điểm (Nakama Ledger)
                  </CardTitle>
                  <CardDescription>
                    Toàn bộ các giao dịch cộng/trừ điểm: Điểm danh, Quay thưởng, Hoàn thành nhiệm vụ, Đổi quà.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingDetail ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : !playerDetail || playerDetail.recentLedger.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                      Chưa có giao dịch điểm nào được ghi nhận trên Nakama.
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Loại giao dịch</TableHead>
                            <TableHead className="text-right">Biến động</TableHead>
                            <TableHead className="text-right">Số dư sau</TableHead>
                            <TableHead>Chi tiết / Ghi chú</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {playerDetail.recentLedger.map((entry) => {
                            const isPositive = entry.amount > 0;
                            return (
                              <TableRow key={entry.postingId}>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(entry.createdAt).toLocaleString("vi-VN")}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="font-mono text-[11px]">
                                    {entry.postingType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-0.5 ${
                                      isPositive
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-rose-600 dark:text-rose-400"
                                    }`}
                                  >
                                    {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                                    {isPositive ? `+${entry.amount}` : entry.amount}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs whitespace-nowrap">
                                  {entry.balanceAfter.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-xs max-w-xs truncate text-muted-foreground font-mono">
                                  {entry.metadata || entry.sourceReference}
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
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Users className="size-10 mx-auto mb-3 opacity-30" />
                <p>Chọn một người chơi từ danh sách bên trái để xem chi tiết số dư và ledger Nakama.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Adjust Points Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAdjustSubmit}>
            <DialogHeader>
              <DialogTitle>Điều chỉnh điểm người chơi</DialogTitle>
              <DialogDescription>
                Thực hiện cộng hoặc trừ điểm trực tiếp trên Nakama cho <strong>{selectedUser?.username}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="adjust_amount">Số điểm (+ để cộng, - để trừ)</Label>
                <Input
                  id="adjust_amount"
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  placeholder="ví dụ: 100 hoặc -50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjust_reason">Lý do điều chỉnh (Audit Log)</Label>
                <Textarea
                  id="adjust_reason"
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="ví dụ: Tặng quà sinh nhật / Bù lỗi quay thưởng..."
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={adjustPending}>
                {adjustPending ? <Loader2 className="size-4 animate-spin" /> : "Xác nhận điều chỉnh"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
