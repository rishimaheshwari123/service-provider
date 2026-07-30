import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  History,
  ImagePlus,
  Loader2,
  PlusCircle,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  POLL_CATEGORIES,
  POLL_AGE_GROUPS,
  getPollCategoryLabel,
  getPollAgeGroupLabel,
} from "@/constants/pollCategories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createPollAPI,
  deletePollAPI,
  getAdminPollsAPI,
  updatePollStatusAPI,
} from "@/service/operations/poll";

type VoteHistory = {
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  vote: "up" | "down";
  votedAt?: string;
};

type Poll = {
  _id: string;
  title: string;
  image: string;
  active: boolean;
  category?: string;
  ageGroup?: string;
  upVotes: number;
  downVotes: number;
  totalVotes: number;
  voteHistory?: VoteHistory[];
  createdAt: string;
};

type PollQueryParams = {
  status?: string;
  category?: string;
  ageGroup?: string;
  search?: string;
};

const formatVoteDate = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

const PollsManagement = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ageGroupFilter, setAgeGroupFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const stats = useMemo(() => {
    return polls.reduce(
      (acc, poll) => ({
        total: acc.total + 1,
        active: acc.active + (poll.active ? 1 : 0),
        votes: acc.votes + (poll.totalVotes || 0),
        upVotes: acc.upVotes + (poll.upVotes || 0),
        downVotes: acc.downVotes + (poll.downVotes || 0),
      }),
      { total: 0, active: 0, votes: 0, upVotes: 0, downVotes: 0 }
    );
  }, [polls]);

  const fetchPolls = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const params: PollQueryParams = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (categoryFilter !== "all") params.category = categoryFilter;
    if (ageGroupFilter !== "all") params.ageGroup = ageGroupFilter;
    if (search.trim()) params.search = search.trim();

    const data = await getAdminPollsAPI(params);
    setPolls(data);
    setLoading(false);
    setRefreshing(false);
  }, [categoryFilter, ageGroupFilter, search, statusFilter]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setAgeGroup("");
    setActive(true);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !category || !ageGroup || !imageFile) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);
    formData.append("ageGroup", ageGroup);
    formData.append("active", active.toString());
    formData.append("image", imageFile);

    const poll = await createPollAPI(formData);
    if (poll) {
      resetForm();
      fetchPolls(true);
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (poll: Poll) => {
    setUpdatingId(poll._id);
    const updatedPoll = await updatePollStatusAPI(poll._id, !poll.active);
    if (updatedPoll) {
      setPolls((prev) => prev.map((item) => (item._id === poll._id ? updatedPoll : item)));
    }
    setUpdatingId("");
  };

  const handleDelete = async (poll: Poll) => {
    const confirmed = window.confirm(`Delete poll "${poll.title}"?`);
    if (!confirmed) return;

    setUpdatingId(poll._id);
    const deleted = await deletePollAPI(poll._id);
    if (deleted) {
      setPolls((prev) => prev.filter((item) => item._id !== poll._id));
    }
    setUpdatingId("");
  };

  return (
    <div className="space-y-6 p-2 pb-10">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Live Voting</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">Poll Management</h1>
            <p className="mt-2 text-gray-600">Create image polls, track counts, and review user voting history.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-md bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs font-semibold text-gray-500">Polls</p>
            </div>
            <div className="rounded-md bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
              <p className="text-xs font-semibold text-blue-700">Active</p>
            </div>
            <div className="rounded-md bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.votes}</p>
              <p className="text-xs font-semibold text-gray-500">Votes</p>
            </div>
            <div className="rounded-md bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{stats.upVotes}</p>
              <p className="text-xs font-semibold text-emerald-700">Up</p>
            </div>
            <div className="rounded-md bg-rose-50 p-3 text-center">
              <p className="text-2xl font-bold text-rose-700">{stats.downVotes}</p>
              <p className="text-xs font-semibold text-rose-700">Down</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Create Poll
            </CardTitle>
            <CardDescription>Title, category, age group, and image are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="poll-title">Poll Title</Label>
                <Input
                  id="poll-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter voting title"
                  maxLength={180}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Poll Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select poll category" />
                  </SelectTrigger>
                  <SelectContent>
                    {POLL_CATEGORIES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Age Group</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {POLL_AGE_GROUPS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label} ({item.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poll-image">Poll Image</Label>
                <label
                  htmlFor="poll-image"
                  className="flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-primary"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Poll preview" className="h-full max-h-64 w-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <ImagePlus className="mx-auto h-10 w-10" />
                      <p className="mt-2 text-sm font-medium">Click to upload image</p>
                    </div>
                  )}
                </label>
                <input
                  id="poll-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  required
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <p className="font-semibold text-gray-900">Active</p>
                  <p className="text-sm text-gray-500">Visible on public voting page</p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>

              <Button type="submit" className="w-full" disabled={submitting || !title.trim() || !category || !ageGroup || !imageFile}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Create Poll
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_140px_160px_180px_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setSearch(searchInput);
                    }}
                    placeholder="Search poll title"
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {POLL_CATEGORIES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Age Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Age Groups</SelectItem>
                    {POLL_AGE_GROUPS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label} ({item.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button type="button" variant="outline" onClick={() => setSearch(searchInput)}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Poll List</h2>
            <Button type="button" variant="outline" onClick={() => fetchPolls(true)} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex min-h-80 items-center justify-center rounded-lg border border-gray-200 bg-white">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : polls.length ? (
            <div className="grid gap-4">
              {polls.map((poll) => {
                const totalVotes = poll.totalVotes || 0;
                const upPercent = totalVotes ? Math.round(((poll.upVotes || 0) / totalVotes) * 100) : 0;
                const downPercent = totalVotes ? 100 - upPercent : 0;
                const voteHistory = poll.voteHistory || [];

                return (
                  <Card key={poll._id} className="overflow-hidden border border-gray-200 shadow-sm">
                    <CardContent className="p-0">
                      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                        <img src={poll.image} alt={poll.title} className="h-52 w-full object-cover md:h-full" />

                        <div className="space-y-4 p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={poll.active ? "default" : "secondary"}>
                                  {poll.active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                  {getPollCategoryLabel(poll.category)}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                                  {getPollAgeGroupLabel(poll.ageGroup)}
                                </Badge>
                              </div>
                              <h3 className="break-words text-xl font-bold text-gray-950">{poll.title}</h3>
                              <p className="text-sm text-gray-500">
                                Created {poll.createdAt ? new Date(poll.createdAt).toLocaleDateString() : ""}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleStatusChange(poll)}
                                disabled={updatingId === poll._id}
                              >
                                {updatingId === poll._id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : poll.active ? (
                                  <PowerOff className="mr-2 h-4 w-4" />
                                ) : (
                                  <Power className="mr-2 h-4 w-4" />
                                )}
                                {poll.active ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => handleDelete(poll)}
                                disabled={updatingId === poll._id}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-md bg-gray-50 p-3">
                              <p className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                <BarChart3 className="h-4 w-4" />
                                Total
                              </p>
                              <p className="mt-1 text-2xl font-bold">{totalVotes}</p>
                            </div>
                            <div className="rounded-md bg-emerald-50 p-3">
                              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                <ThumbsUp className="h-4 w-4" />
                                Up
                              </p>
                              <p className="mt-1 text-2xl font-bold text-emerald-700">
                                {poll.upVotes || 0} ({upPercent}%)
                              </p>
                            </div>
                            <div className="rounded-md bg-rose-50 p-3">
                              <p className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                                <ThumbsDown className="h-4 w-4" />
                                Down
                              </p>
                              <p className="mt-1 text-2xl font-bold text-rose-700">
                                {poll.downVotes || 0} ({downPercent}%)
                              </p>
                            </div>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full flex items-center justify-between border border-gray-200 rounded-lg bg-white px-4 py-3 h-auto hover:bg-gray-50 text-left font-normal transition-all shadow-sm hover:shadow"
                              >
                                <div className="flex items-center gap-2 font-semibold text-gray-900">
                                  <History className="h-4 w-4 text-primary" />
                                  Vote History
                                </div>
                                <Badge variant="secondary" className="ml-2">
                                  {voteHistory.length} records
                                </Badge>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-950">
                                  <History className="h-5 w-5 text-primary" />
                                  Vote History - {poll.title}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="flex-1 overflow-y-auto mt-4 pr-1">
                                {voteHistory.length ? (
                                  <div className="divide-y divide-gray-100">
                                    {voteHistory.map((item) => (
                                      <div key={`${item.userId}-${item.votedAt}`} className="grid gap-3 py-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                                        <div className="flex min-w-0 items-center gap-3">
                                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                            <UserRound className="h-4 w-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="truncate font-semibold text-gray-900 text-left">{item.userName || "Unknown User"}</p>
                                            {(item.userPhone || item.userEmail) && (
                                              <p className="truncate text-sm text-gray-500 text-left">
                                                {item.userPhone || item.userEmail}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <Badge
                                          variant={item.vote === "up" ? "default" : "destructive"}
                                          className={item.vote === "up" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-white"}
                                        >
                                          {item.vote === "up" ? "Thumb Up" : "Thumb Down"}
                                        </Badge>

                                        <span className="text-sm text-gray-500">{formatVoteDate(item.votedAt)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-6 text-center text-sm text-gray-500">
                                    No votes recorded yet.
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">No polls found</h2>
              <p className="mt-2 text-gray-600">Create a poll or adjust filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollsManagement;