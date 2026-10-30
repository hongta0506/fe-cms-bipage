"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Award, CheckCircle2, ChevronRight, Dices, Edit2, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RewardTier {
  id: number;
  tier_id: string;
  tier_name: string;
  cost_per_spin: number;
  max_spins?: number;
  enabled: boolean;
  sort_order?: number;
}

interface RewardPrize {
  id: number;
  tier_id: string;
  prize_id: string;
  name: string;
  points: number;
  weight: number;
  enabled: boolean;
  sort_order?: number;
  schedule_date?: string;
  schedule_start?: string;
  schedule_end?: string;
}

export default function RewardPrizesPage() {
  const [tiers, setTiers] = useState<RewardTier[]>([]);
  const [prizes, setPrizes] = useState<RewardPrize[]>([]);
  const [activeTierId, setActiveTierId] = useState<string>("bronze");
  const [loading, setLoading] = useState(true);
  const [publishPending, startPublishTransition] = useTransition();

  // Dialog state
  const [editingPrize, setEditingPrize] = useState<RewardPrize | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formPrizeId, setFormPrizeId] = useState("");
  const [formName, setFormName] = useState("");
  const [formPoints, setFormPoints] = useState(0);
  const [formWeight, setFormWeight] = useState(10);
  const [formEnabled, setFormEnabled] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [savingPrize, setSavingPrize] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tiersRes, prizesRes] = await Promise.all([
        fetch("/api/content/reward_tier?limit=50"),
        fetch("/api/content/reward_prize?limit=100"),
      ]);
      const tiersJson = await tiersRes.json();
      const prizesJson = await prizesRes.json();

      const fetchedTiers: RewardTier[] = tiersJson?.data?.items ?? tiersJson?.data ?? [];
      const fetchedPrizes: RewardPrize[] = prizesJson?.data?.items ?? prizesJson?.data ?? [];

      setTiers(fetchedTiers);
      setPrizes(fetchedPrizes);

      if (fetchedTiers.length > 0 && !fetchedTiers.some((t) => t.tier_id === activeTierId)) {
        setActiveTierId(fetchedTiers[0].tier_id);
      }
    } catch (err) {
      toast.error("Không thể tải dữ liệu giải thưởng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const activeTier = tiers.find((t) => t.tier_id === activeTierId);
  const tierPrizes = prizes
    .filter((p) => p.tier_id === activeTierId)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const totalWeight = tierPrizes.reduce((sum, p) => sum + (p.enabled ? Number(p.weight || 0) : 0), 0);
  const expectedReturn =
    totalWeight > 0
      ? tierPrizes.reduce((sum, p) => sum + (p.enabled ? (p.points * p.weight) / totalWeight : 0), 0)
      : 0;

  const handleOpenCreate = () => {
    setEditingPrize(null);
    setFormPrizeId(`prize-${Date.now().toString().slice(-4)}`);
    setFormName("");
    setFormPoints(10);
    setFormWeight(10);
    setFormEnabled(true);
    setFormSortOrder(tierPrizes.length + 1);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (prize: RewardPrize) => {
    setEditingPrize(prize);
    setFormPrizeId(prize.prize_id);
    setFormName(prize.name);
    setFormPoints(prize.points);
    setFormWeight(prize.weight);
    setFormEnabled(prize.enabled);
    setFormSortOrder(prize.sort_order ?? 1);
    setIsDialogOpen(true);
  };

  const handleSavePrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrizeId.trim() || !formName.trim()) {
      toast.error("Vui lòng điền đủ mã và tên giải");
      return;
    }

    try {
      setSavingPrize(true);
      const payload = {
        tier_id: activeTierId,
        prize_id: formPrizeId.trim(),
        name: formName.trim(),
        points: Number(formPoints),
        weight: Number(formWeight),
        enabled: formEnabled,
        sort_order: Number(formSortOrder),
      };

      if (editingPrize) {
        const res = await fetch(`/api/content/reward_prize/${editingPrize.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Cập nhật thất bại");
        toast.success("Đã cập nhật giải thưởng");
      } else {
        const res = await fetch(`/api/content/reward_prize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Tạo mới thất bại");
        toast.success("Đã thêm giải thưởng mới");
      }

      setIsDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu dữ liệu");
    } finally {
      setSavingPrize(false);
    }
  };

  const handleDeletePrize = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giải thưởng này?")) return;
    try {
      const res = await fetch(`/api/content/reward_prize/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");
      toast.success("Đã xóa giải thưởng");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa giải thưởng");
    }
  };

  const handleQuickPublish = () => {
    startPublishTransition(async () => {
      try {
        const res = await fetch("/api/rewards/publish", { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Publish thất bại");
        toast.success(`Xuất bản thành công phiên bản v${json.version}!`);
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi xuất bản sang Nakama");
      }
    });
  };

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
            Cấu hình Giải thưởng & Ma trận Xác suất
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách giải thưởng, thiết lập tỷ lệ trúng theo từng Bậc thưởng và đồng bộ trực tiếp sang Nakama.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            disabled={publishPending}
            onClick={handleQuickPublish}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          >
            {publishPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Xuất bản sang Nakama
          </Button>
          <Button variant="outline" onClick={handleOpenCreate} className="gap-2">
            <Plus className="size-4" />
            Thêm giải thưởng
          </Button>
        </div>
      </div>

      {/* Tier Selector Tabs */}
      {tiers.length > 0 && (
        <Tabs value={activeTierId} onValueChange={setActiveTierId}>
          <TabsList className="grid grid-flow-col auto-cols-fr max-w-md">
            {tiers.map((t) => (
              <TabsTrigger key={t.tier_id} value={t.tier_id} className="gap-2">
                <Dices className="size-3.5" />
                {t.tier_name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Matrix Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Số giải trên vòng quay</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {tierPrizes.length} / 8
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {tierPrizes.length === 8 ? "Đạt chuẩn 8 ô vòng quay" : "Khuyến nghị chuẩn 8 ô"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng trọng số (Total Weight)</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalWeight}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tổng weight các giải đang kích hoạt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kỳ vọng hoàn điểm (RTP / Spin)</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {expectedReturn.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">pts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Chi phí quay: {activeTier?.cost_per_spin ?? 0} pts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trạng thái Bậc ({activeTierId})</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {activeTier?.enabled ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-lg">
                  <CheckCircle2 className="size-5" /> Đang mở
                </span>
              ) : (
                <span className="text-zinc-500 text-lg">Tạm đóng</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Giới hạn: {activeTier?.max_spins ? `${activeTier.max_spins} lượt` : "Không giới hạn"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prizes Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách Giải thưởng — {activeTier?.tier_name ?? activeTierId}</CardTitle>
          <CardDescription>
            Tỷ lệ phần trăm được tính realtime: <code>(Trọng số / Tổng trọng số) × 100%</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : tierPrizes.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Award className="size-10 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-medium">Chưa có giải thưởng nào trong bậc này</p>
              <Button size="sm" onClick={handleOpenCreate} className="mt-4 gap-2">
                <Plus className="size-4" /> Tạo giải đầu tiên
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Mã giải (ID)</TableHead>
                    <TableHead>Tên hiển thị</TableHead>
                    <TableHead className="text-right">Điểm cộng</TableHead>
                    <TableHead className="text-right">Trọng số (Weight)</TableHead>
                    <TableHead className="text-right">Tỷ lệ xác suất</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tierPrizes.map((p, idx) => {
                    const prob = totalWeight > 0 && p.enabled ? ((p.weight / totalWeight) * 100).toFixed(1) : "0.0";
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {p.sort_order ?? idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{p.prize_id}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {p.points > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">+{p.points} pts</span>
                          ) : (
                            <span className="text-muted-foreground">0 (hiện vật)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">{p.weight}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                          {prob}%
                        </TableCell>
                        <TableCell className="text-center">
                          {p.enabled ? (
                            <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                              Bật
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Tắt</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="size-8" onClick={() => handleOpenEdit(p)}>
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeletePrize(p.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
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

      {/* Create / Edit Prize Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSavePrize}>
            <DialogHeader>
              <DialogTitle>{editingPrize ? "Chỉnh sửa giải thưởng" : "Thêm giải thưởng mới"}</DialogTitle>
              <DialogDescription>
                Thiết lập thông số cho giải thưởng thuộc bậc <strong>{activeTier?.tier_name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="prize_id">Mã giải (Prize ID)</Label>
                <Input
                  id="prize_id"
                  value={formPrizeId}
                  onChange={(e) => setFormPrizeId(e.target.value)}
                  placeholder="ví dụ: voucher-50k"
                  disabled={Boolean(editingPrize)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên hiển thị trên vòng quay</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ví dụ: Voucher 50.000đ"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Điểm thưởng (0 nếu là quà)</Label>
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Trọng số xác suất (Weight)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Thứ tự ô (1 - 8)</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min="1"
                    max="10"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch id="enabled" checked={formEnabled} onCheckedChange={setFormEnabled} />
                  <Label htmlFor="enabled">Kích hoạt giải</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={savingPrize}>
                {savingPrize ? <Loader2 className="size-4 animate-spin" /> : "Lưu giải thưởng"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
