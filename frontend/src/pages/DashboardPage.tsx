import { useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTaskStats, fetchTasks } from "../features/tasks/tasksSlice";

const statusColors = {
  PENDING: "#eab308",
  PROCESSING: "#0ea5e9",
  COMPLETED: "#22c55e",
  FAILED: "#ef4444",
};

const statCards = [
  { label: "Total", valueKey: "totalTasks", icon: Activity },
  { label: "Pending", valueKey: "PENDING", icon: Clock3 },
  { label: "Completed", valueKey: "COMPLETED", icon: CheckCircle2 },
  { label: "Failed", valueKey: "FAILED", icon: TriangleAlert },
] as const;

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, items } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    void dispatch(fetchTaskStats());
    void dispatch(fetchTasks({ limit: 8 }));
  }, [dispatch]);

  const pieData = [
    { name: "Pending", key: "PENDING", value: stats?.PENDING ?? 0 },
    { name: "Processing", key: "PROCESSING", value: stats?.PROCESSING ?? 0 },
    { name: "Completed", key: "COMPLETED", value: stats?.COMPLETED ?? 0 },
    { name: "Failed", key: "FAILED", value: stats?.FAILED ?? 0 },
  ];

  const visiblePieData = pieData.some((entry) => entry.value > 0)
    ? pieData
    : [{ name: "No tasks", key: "EMPTY", value: 1 }];

  const activityData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const label = date.toLocaleDateString(undefined, { weekday: "short" });
    const count = items.filter((task) => {
      const created = new Date(task.createdAt);
      return created.toDateString() === date.toDateString();
    }).length;

    return { day: label, tasks: count };
  });

  return (
    <section className="grid gap-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of task volume, processing status, and recent queue activity.
          </p>
        </div>
        <p className="text-xs text-slate-600">Updated from live API data</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, valueKey, icon: Icon }) => (
          <article className="glass-panel rounded-xl p-5" key={label}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-400">{label}</p>
              <Icon aria-hidden="true" size={18} className="text-slate-500" />
            </div>
            <strong className="mt-5 block text-3xl font-semibold tracking-tight text-white">
              {stats?.[valueKey] ?? 0}
            </strong>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="glass-panel rounded-xl p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">
              Task Status Distribution
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current split across pending, processing, completed, and failed tasks.
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visiblePieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={76}
                  outerRadius={108}
                  paddingAngle={2}
                  stroke="#0f172a"
                  strokeWidth={3}
                >
                  {visiblePieData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={
                        entry.key === "EMPTY"
                          ? "#334155"
                          : statusColors[entry.key as keyof typeof statusColors]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    color: "#e2e8f0",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass-panel rounded-xl p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tasks created over the last seven days.
            </p>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(51, 65, 85, 0.28)" }}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="tasks" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 divide-y divide-slate-800 rounded-lg border border-slate-800">
            {items.slice(0, 5).length ? (
              items.slice(0, 5).map((task) => (
                <div
                  className="flex items-center justify-between gap-4 px-4 py-3"
                  key={task.publicId}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-600">{task.publicId}</p>
                  </div>
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                    {task.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No recent tasks yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
