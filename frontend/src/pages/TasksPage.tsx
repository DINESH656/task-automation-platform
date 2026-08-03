import { useEffect, useState, type FormEvent } from "react";
import { Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  createTask,
  deleteTask,
  fetchTasks,
  retryTask,
} from "../features/tasks/tasksSlice";
import type { TaskStatus } from "../types/api";

const statuses: Array<"ALL" | TaskStatus> = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
];

const statusStyles: Record<TaskStatus, string> = {
  PENDING: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
  PROCESSING: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  COMPLETED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  FAILED: "border-red-500/20 bg-red-500/10 text-red-300",
};

const statusDotStyles: Record<TaskStatus, string> = {
  PENDING: "bg-yellow-400",
  PROCESSING: "bg-sky-400",
  COMPLETED: "bg-emerald-400",
  FAILED: "bg-red-400",
};

export function TasksPage() {
  const dispatch = useAppDispatch();
  const { items, pagination, query, status, error } = useAppSelector(
    (state) => state.tasks,
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    void dispatch(
      fetchTasks({ page: 1, limit: 10, sort: "createdAt", order: "desc" }),
    );
  }, [dispatch]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await dispatch(
      createTask({
        title,
        description: description || undefined,
      }),
    );

    if (createTask.fulfilled.match(result)) {
      setTitle("");
      setDescription("");
      setIsCreateOpen(false);
      void dispatch(fetchTasks(query));
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void dispatch(fetchTasks({ ...query, page: 1, search: search || undefined }));
  };

  return (
    <section className="grid gap-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage task creation, queue retries, and task cleanup.
          </p>
        </div>

        <button
          type="button"
          className="neon-button"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus aria-hidden="true" size={17} />
          New task
        </button>
      </header>

      <section className="glass-panel rounded-xl">
        <div className="grid gap-3 border-b border-slate-800 p-4 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center">
          <form className="relative" onSubmit={handleSearch}>
            <Search
              aria-hidden="true"
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              className="field-input w-full pl-10"
              placeholder="Search tasks"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>

          <div
            className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-1"
            aria-label="Filter by status"
          >
            {statuses.map((option) => {
              const active =
                (option === "ALL" && !query.status) || query.status === option;

              return (
                <button
                  key={option}
                  type="button"
                  className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium transition ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                  }`}
                  onClick={() =>
                    void dispatch(
                      fetchTasks({
                        ...query,
                        page: 1,
                        status: option === "ALL" ? undefined : option,
                      }),
                    )
                  }
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p className="mx-4 mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {status === "loading" ? (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-sm text-slate-500"
                    colSpan={4}
                  >
                    Loading tasks...
                  </td>
                </tr>
              ) : null}

              {status !== "loading" && !items.length ? (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-sm text-slate-500"
                    colSpan={4}
                  >
                    No matching tasks.
                  </td>
                </tr>
              ) : null}

              {items.map((task) => (
                <tr
                  className="group transition hover:bg-slate-900/70"
                  key={task.publicId}
                >
                  <td className="px-4 py-4">
                    <div className="max-w-[280px]">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {task.publicId}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="max-w-[320px] truncate text-sm text-slate-400">
                      {task.description || "No description"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[task.status]}`}
                      />
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        className="ghost-icon-button"
                        title="Retry task"
                        aria-label={`Retry ${task.title}`}
                        disabled={task.status !== "FAILED"}
                        onClick={() => void dispatch(retryTask(task.publicId))}
                      >
                        <RotateCcw aria-hidden="true" size={16} />
                      </button>
                      <button
                        type="button"
                        className="ghost-icon-button hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                        title="Delete task"
                        aria-label={`Delete ${task.title}`}
                        onClick={() => void dispatch(deleteTask(task.publicId))}
                      >
                        <Trash2 aria-hidden="true" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination ? (
          <footer className="flex flex-col gap-3 border-t border-slate-800 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 disabled:opacity-40"
                disabled={pagination.page <= 1}
                onClick={() =>
                  void dispatch(fetchTasks({ ...query, page: pagination.page - 1 }))
                }
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 disabled:opacity-40"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  void dispatch(fetchTasks({ ...query, page: pagination.page + 1 }))
                }
              >
                Next
              </button>
            </div>
          </footer>
        ) : null}
      </section>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <form
            className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/30 sm:p-6"
            onSubmit={handleCreate}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Create task</h2>
                <p className="mt-1 text-sm text-slate-500">
                  New tasks are queued for asynchronous processing.
                </p>
              </div>
              <button
                type="button"
                className="ghost-icon-button"
                aria-label="Close create task modal"
                onClick={() => setIsCreateOpen(false)}
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              <label className="field-label">
                Title
                <input
                  className="field-input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={255}
                  required
                />
              </label>

              <label className="field-label">
                Description
                <textarea
                  className="field-input min-h-28 resize-none"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-lg border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="neon-button">
                Create task
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
