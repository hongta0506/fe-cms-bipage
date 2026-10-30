"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Package,
  RefreshCw,
  Send,
  Truck,
  XCircle,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface RedemptionRecord {
  redemptionId: string;
  playerId: string;
  postingId: string;
  itemId: string;
  itemName: string;
  pointsCost: number;
  recipientName: string;
  phone: string;
  address: string;
  note: string;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export default function RewardClaimsPage() {
  const [claims, setClaims] = useState<RedemptionRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dialog actions
  const [activeClaim, setActiveClaim] = useState<RedemptionRecord | null>(null);
  const [actionType, setActionType] = useState<"approve" | "fulfill" | "reject" | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchClaims = async (status = statusFilter) => {
    try {
      setLoading(true);
      const url =
        status && status !== "all"
          ? `/api/rewards/claims?status=${status}&limit=50`
          : `/api/rewards/claims?limit=50`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể tải danh sách đổi quà");
      setClaims(json.items || []);
      setTotal(json.total || 0);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchClaims(statusFilter);
  }, [statusFilter]);

  const handleAction = async () => {
    if (!activeClaim || !actionType) return;

    let targetStatus = "approved";
    if (actionType === "fulfill") targetStatus = "fulfilled";
    if (actionType === "reject") {
      targetStatus = "rejected";
      if (!reason.trim()) {
        toast.error("Vui lòng nhập lý do từ chối để hoàn điểm cho người chơi");
        return;
      }
    }

    try {
      setProcessing(true);
      const res = await fetch(`/api/rewards/claims/${activeClaim.redemptionId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus: targetStatus,
          reason: reason.trim() || undefined,
          trackingCode: trackingCode.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Cập nhật thất bại");

      if (targetStatus === "rejected") {
        toast.success(`Đã từ chối đơn và hoàn trả ${json.pointsRefunded ?? activeClaim.pointsCost} điểm cho người chơi`);
      } else if (targetStatus === "fulfilled") {
        toast.success("Đã hoàn tất trao quà thành công!");
      } else {
        toast.success("Đã duyệt yêu cầu đổi quà");
      }

      setActionType(null);
      setActiveClaim(null);
      setReason("");
      setTrackingCode("");
      await fetchClaims(statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Lỗi xử lý");
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = claims.filter((c) => c.status === "pending").length;

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
            <Award className="size-7 text-primary" />
            Quản lý Đổi thưởng & Trao quà (Fulfillment)
          </h1>
          <p className="text-sm text-muted-foreground">
            Quy trình phê duyệt đơn đổi thưởng từ Nakama. Khi từ chối, điểm sẽ tự động hoàn lại cho người chơi.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => void fetchClaims(statusFilter)} className="gap-2">
          <RefreshCw className="size-4" />
          Làm mới
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng yêu cầu đổi quà</CardDescription>
            <CardTitle className="text-2xl font-bold">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Toàn bộ đơn hàng ghi nhận</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Đang chờ phê duyệt</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cần xử lý phê duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cơ chế hoàn điểm tự động</CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-5" /> Bật an toàn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Ledger `REDEEM_REFUND` Nakama</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Đồng bộ dữ liệu</CardDescription>
            <CardTitle className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Realtime RPC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Kết nối database Nakama server</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({total})</TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="size-3.5 text-amber-500" /> Chờ duyệt
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <Package className="size-3.5 text-blue-500" /> Đã duyệt
          </TabsTrigger>
          <TabsTrigger value="fulfilled" className="gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" /> Đã trao
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="size-3.5 text-rose-500" /> Đã từ chối
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Claims Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách yêu cầu đổi quà</CardTitle>
          <CardDescription>
            Xem thông tin người nhận, địa chỉ và thao tác cập nhật trạng thái đơn hàng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-lg">
              <Package className="size-10 mx-auto text-muted-foreground mb-3 opacity-30" />
              Chưa có đơn đổi quà nào trong danh mục này.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Vật phẩm / Điểm trừ</TableHead>
                    <TableHead>Người nhận & Liên hệ</TableHead>
                    <TableHead>Địa chỉ nhận hàng</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.redemptionId}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(claim.createdAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">{claim.itemName}</div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-mono font-medium">
                          -{claim.pointsCost.toLocaleString()} pts
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{claim.recipientName || "—"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{claim.phone || "—"}</div>
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate text-muted-foreground">
                        {claim.address || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {claim.status === "pending" && (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
                            Chờ duyệt
                          </Badge>
                        )}
                        {claim.status === "approved" && (
                          <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30">
                            Đã duyệt
                          </Badge>
                        )}
                        {claim.status === "fulfilled" && (
                          <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                            Đã trao
                          </Badge>
                        )}
                        {claim.status === "rejected" && (
                          <Badge variant="outline" className="border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30">
                            Đã từ chối (Hoàn điểm)
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate text-muted-foreground font-mono">
                        {claim.note || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {claim.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-emerald-600 border-emerald-500 hover:bg-emerald-50"
                                onClick={() => {
                                  setActiveClaim(claim);
                                  setActionType("approve");
                                }}
                              >
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-rose-600 border-rose-500 hover:bg-rose-50"
                                onClick={() => {
                                  setActiveClaim(claim);
                                  setActionType("reject");
                                }}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}
                          {claim.status === "approved" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 text-xs gap-1.5"
                              onClick={() => {
                                setActiveClaim(claim);
                                setActionType("fulfill");
                              }}
                            >
                              <Truck className="size-3.5" /> Trao quà
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation / Action Dialog */}
      <Dialog open={Boolean(actionType)} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Phê duyệt yêu cầu đổi quà"}
              {actionType === "fulfill" && "Xác nhận đã gửi / trao quà"}
              {actionType === "reject" && "Từ chối yêu cầu & Hoàn điểm"}
            </DialogTitle>
            <DialogDescription>
              Đơn hàng: <strong>{activeClaim?.itemName}</strong> — Người nhận: <strong>{activeClaim?.recipientName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === "fulfill" && (
              <div className="space-y-2">
                <Label htmlFor="tracking_code">Mã vận đơn / Số serial thẻ cào</Label>
                <Input
                  id="tracking_code"
                  placeholder="ví dụ: VNPOST-123456789 hoặc SERIAL-XXXX"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                />
              </div>
            )}

            {actionType === "reject" && (
              <div className="space-y-2">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    Hệ thống sẽ tự động hoàn trả <strong>{activeClaim?.pointsCost} điểm</strong> vào tài khoản Nakama của người chơi.
                  </span>
                </div>
                <Label htmlFor="reject_reason">Lý do từ chối (bắt buộc)</Label>
                <Textarea
                  id="reject_reason"
                  rows={3}
                  placeholder="ví dụ: Hết quà tặng trong kho / Địa chỉ không hợp lệ..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            )}

            {actionType === "approve" && (
              <p className="text-sm text-muted-foreground">
                Xác nhận thông tin hợp lệ và chuyển đơn hàng sang trạng thái chờ giao quà.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Hủy
            </Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              disabled={processing}
              onClick={handleAction}
            >
              {processing ? <Loader2 className="size-4 animate-spin" /> : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
