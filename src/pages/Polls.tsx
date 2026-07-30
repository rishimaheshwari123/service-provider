import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  BarChart3,
  Filter,
  Loader2,
  LogIn,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  POLL_AGE_GROUPS,
  POLL_CATEGORIES,
  getPollAgeGroupLabel,
  getPollCategoryLabel,
} from "@/constants/pollCategories";
import { RootState } from "@/redux/store";
import { getPollsAPI, votePollAPI } from "@/service/operations/poll";

type PollVote = "up" | "down";

type Poll = {
  _id: string;
  title: string;
  image: string;
  category?: string;
  ageGroup?: string;
  upVotes: number;
  downVotes: number;
  totalVotes: number;
  currentUserVote?: PollVote | null;
};

type PollQueryParams = {
  category?: string;
  ageGroup?: string;
};

const Polls = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ageGroupFilter, setAgeGroupFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votingKey, setVotingKey] = useState("");

  const totals = useMemo(() => {
    return polls.reduce(
      (acc, poll) => ({
        polls: acc.polls + 1,
        votes: acc.votes + (poll.totalVotes || 0),
        upVotes: acc.upVotes + (poll.upVotes || 0),
        downVotes: acc.downVotes + (poll.downVotes || 0),
      }),
      { polls: 0, votes: 0, upVotes: 0, downVotes: 0 }
    );
  }, [polls]);

  const fetchPolls = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const params: PollQueryParams = {};
    if (categoryFilter !== "all") params.category = categoryFilter;
    if (ageGroupFilter !== "all") params.ageGroup = ageGroupFilter;

    const data = await getPollsAPI(params);
    setPolls(data);
    setLoading(false);
    setRefreshing(false);
  }, [ageGroupFilter, categoryFilter]);

  useEffect(() => {
    fetchPolls();
    const intervalId = window.setInterval(() => fetchPolls(true), 10000);

    return () => window.clearInterval(intervalId);
  }, [fetchPolls]);

  const handleVote = async (pollId: string, vote: PollVote) => {
    if (!token) {
      toast.info("Please login to vote.");
      navigate("/login");
      return;
    }

    if (user?.role !== "user") {
      toast.info("Only customer users can vote.");
      return;
    }

    setVotingKey(`${pollId}-${vote}`);
    const updatedPoll = await votePollAPI(pollId, vote);
    if (updatedPoll) {
      setPolls((prev) => prev.map((poll) => (poll._id === pollId ? updatedPoll : poll)));
    }
    setVotingKey("");
  };

  const renderPoll = (poll: Poll) => {
    const totalVotes = poll.totalVotes || 0;
    const upPercent = totalVotes ? Math.round(((poll.upVotes || 0) / totalVotes) * 100) : 0;
    const downPercent = totalVotes ? 100 - upPercent : 0;
    const upSelected = poll.currentUserVote === "up";
    const downSelected = poll.currentUserVote === "down";

    return (
      <Card key={poll._id} className="overflow-hidden border border-gray-200 shadow-sm">
        <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
          <img
            src={poll.image}
            alt={poll.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <CardContent className="space-y-5 p-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{getPollCategoryLabel(poll.category)}</Badge>
                <Badge variant="outline">{getPollAgeGroupLabel(poll.ageGroup)}</Badge>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-gray-600">
                <BarChart3 className="h-4 w-4" />
                {totalVotes}
              </span>
            </div>

            <h2 className="text-xl font-bold leading-snug text-gray-900">{poll.title}</h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-emerald-700">
                  <ThumbsUp className="h-4 w-4" />
                  Upvotes
                </span>
                <span className="font-semibold text-gray-700">
                  {poll.upVotes || 0} ({upPercent}%)
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full bg-emerald-500" style={{ width: `${upPercent}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-rose-700">
                  <ThumbsDown className="h-4 w-4" />
                  Downvotes
                </span>
                <span className="font-semibold text-gray-700">
                  {poll.downVotes || 0} ({downPercent}%)
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full bg-rose-500" style={{ width: `${downPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={upSelected ? "default" : "outline"}
              className={upSelected ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              onClick={() => handleVote(poll._id, "up")}
              disabled={!!votingKey}
            >
              {votingKey === `${poll._id}-up` ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className="mr-2 h-4 w-4" />
              )}
              Thumb Up
            </Button>
            <Button
              type="button"
              variant={downSelected ? "destructive" : "outline"}
              onClick={() => handleVote(poll._id, "down")}
              disabled={!!votingKey}
            >
              {votingKey === `${poll._id}-down` ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ThumbsDown className="mr-2 h-4 w-4" />
              )}
              Thumb Down
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto w-11/12 max-w-7xl py-10">
        <div className="mb-8 flex flex-col gap-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Live Voting</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-950 md:text-4xl">Vote on Active Polls</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Choose thumb up or thumb down. Counts refresh automatically while the page is open.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-gray-50 px-4 py-3">
              <p className="text-2xl font-bold text-gray-950">{totals.polls}</p>
              <p className="text-xs font-semibold text-gray-500">Polls</p>
            </div>
            <div className="rounded-md bg-emerald-50 px-4 py-3">
              <p className="text-2xl font-bold text-emerald-700">{totals.upVotes}</p>
              <p className="text-xs font-semibold text-emerald-700">Up</p>
            </div>
            <div className="rounded-md bg-rose-50 px-4 py-3">
              <p className="text-2xl font-bold text-rose-700">{totals.downVotes}</p>
              <p className="text-xs font-semibold text-rose-700">Down</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter className="h-4 w-4 text-primary" />
            Filter polls
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[220px_240px_auto] lg:items-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {POLL_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All age groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Age Groups</SelectItem>
                {POLL_AGE_GROUPS.map((ageGroup) => (
                  <SelectItem key={ageGroup.value} value={ageGroup.value}>
                    {ageGroup.label} ({ageGroup.description})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="button" variant="outline" onClick={() => fetchPolls(true)} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {!token && (
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">Login is required before casting a vote.</p>
            <Button asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login to Vote
              </Link>
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : polls.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{polls.map(renderPoll)}</div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">No active polls found</h2>
            <p className="mt-2 text-gray-600">Please check again after admin creates a poll.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Polls;