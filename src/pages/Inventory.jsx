import { useEffect, useState } from "react";
import API from "../services/api";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, item_name }
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    unit: "kilogram",
    category: "OTHERS",
  });

  const fetchInventory = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await API.get("/inventory/");
      setItems(res.data || []);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(true);
  }, []);

  const getAvailable = (i) => i.quantity - i.reserved_quantity;

  const filtered = items.filter((i) => {
    if (filter !== "ALL" && i.category !== filter) return false;
    if (search && !i.item_name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const total = items.reduce((a, b) => a + b.quantity, 0);
  const reserved = items.reduce((a, b) => a + b.reserved_quantity, 0);

  const handleUpdateQuantity = async (id, newQuantity) => {
    const finalQuantity = Math.max(0, Number(newQuantity));

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: finalQuantity } : item
      )
    );

    try {
      await API.patch(`/inventory/${id}`, {
        quantity: finalQuantity,
      });
      fetchInventory(false);
    } catch {
      fetchInventory(false); // Revert on failure
    }
    setEditingId(null);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!newItem.item_name || !newItem.quantity || !newItem.unit) {
      setFormError("Please add the details to initiate");
      return;
    }

    setFormError("");
    setAdding(true);

    try {
      await API.post("/inventory/", {
        ...newItem,
        quantity: parseFloat(newItem.quantity),
      });

      setShowForm(false);
      fetchInventory(false);
      setNewItem({ item_name: "", quantity: "", unit: "kilogram", category: "OTHERS" });
    } catch {
      setFormError("Failed to add item. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await API.delete(`/inventory/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchInventory(false);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Failed to delete item. Please try again.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HERO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Units" value={total} />
        <StatCard label="Reserved" value={reserved} />
        <StatCard label="Available" value={total - reserved} highlight />
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Inventory </h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-5 py-2 rounded-lg w-full sm:w-auto"
        >
          + Add Item
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "FOOD", "MEDICAL", "WATER", "OTHERS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${filter === f ? "bg-primary text-white" : "bg-surface_high"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search inventory..."
        className="w-full max-w-md px-4 py-3 rounded-lg bg-surface_high"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* GRID */}
      {loading ? (
        <div className="text-center p-10">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((i) => {
            const available = getAvailable(i);
            const low = available < i.quantity * 0.2;

            return (
              <div
                key={i.id}
                className="bg-surface_high p-5 rounded-xl flex flex-col gap-4"
              >
                {/* CARD HEADER */}
                <div className="flex justify-between items-start">
                  <h3 className="font-bold">{i.item_name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-surface px-2 py-1 rounded">
                      {i.category}
                    </span>
                    {/* DELETE BUTTON */}
                    <button
                      title="Delete item"
                      onClick={() => {
                        setDeleteTarget({ id: i.id, item_name: i.item_name, reserved_quantity: i.reserved_quantity });
                        setDeleteError("");
                      }}
                      className="text-red-400 hover:text-red-600 hover:bg-red-500/10 p-1 rounded-lg transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 text-center">
                  <MiniStat label="Total" value={i.quantity} />
                  <MiniStat label="Reserved" value={i.reserved_quantity} />
                  <MiniStat label="Available" value={available} />
                </div>

                {/* LOW STOCK */}
                {low && (
                  <div className="text-xs text-red-500 font-semibold">
                    ⚠ Low Stock
                  </div>
                )}

                {/* CONTROLS */}
                <div className="pt-2 mt-auto">
                  {editingId === i.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={editValue}
                        onChange={(e) => {
                          if (Number(e.target.value) >= 0 || e.target.value === "") {
                            setEditValue(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-surface text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/40 border border-black/5"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(i.id, editValue)}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-surface text-on_surface_variant text-xs font-bold rounded-lg hover:bg-black/5 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(i.id);
                        setEditValue(i.quantity);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit Quantity
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center">
          <div className="bg-surface_lowest p-6 rounded-xl w-full max-w-md space-y-4 relative">
            <button
              onClick={() => {
                setShowForm(false);
                setFormError("");
              }}
              className="absolute top-4 right-4 text-on_surface_variant hover:text-on_surface transition"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <h2 className="font-bold text-lg">Add Item</h2>

            {formError && (
              <div className="text-red-500 text-sm font-semibold">{formError}</div>
            )}

            <form onSubmit={handleAddItem} className="space-y-3">
              <input
                placeholder="Item"
                value={newItem.item_name}
                className="w-full px-3 py-2 rounded bg-surface_high outline-none focus:ring-2 focus:ring-primary/40"
                onChange={(e) =>
                  setNewItem({ ...newItem, item_name: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  placeholder="Qty"
                  value={newItem.quantity}
                  className="px-3 py-2 rounded bg-surface_high outline-none focus:ring-2 focus:ring-primary/40"
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: e.target.value })
                  }
                />

                <select
                  value={newItem.unit}
                  className="px-3 py-2 rounded bg-surface_high outline-none focus:ring-2 focus:ring-primary/40"
                  onChange={(e) =>
                    setNewItem({ ...newItem, unit: e.target.value })
                  }
                >
                  <option value="" disabled>Select Unit</option>
                  <option value="kilogram">kilogram</option>
                  <option value="pound">pound</option>
                  <option value="ounce">ounce</option>
                  <option value="ton">ton</option>
                </select>
              </div>

              <button className="w-full py-2 bg-primary text-white rounded hover:opacity-90 transition">
                {adding ? "Adding..." : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center">
          <div className="bg-surface_lowest p-6 rounded-xl w-full max-w-sm space-y-4 shadow-xl">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mx-auto">
              <span className="material-symbols-outlined text-red-500 text-[28px]">delete_forever</span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="font-bold text-lg">Delete Item?</h2>
              <p className="text-sm text-on_surface_variant">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-on_surface">"{deleteTarget.item_name}"</span>?
                This action cannot be undone.
              </p>
              {deleteTarget.reserved_quantity > 0 && (
                <p className="text-xs text-amber-500 font-semibold mt-1">
                  ⚠ This item has {deleteTarget.reserved_quantity} units reserved and cannot be deleted.
                </p>
              )}
            </div>

            {deleteError && (
              <div className="text-red-500 text-sm font-semibold text-center bg-red-500/10 px-3 py-2 rounded-lg">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError("");
                }}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-surface_high text-on_surface_variant font-semibold hover:bg-black/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, highlight }) => (
  <div
    className={`p-5 rounded-xl ${highlight ? "bg-primary text-white" : "bg-surface_high"
      }`}
  >
    <p className="text-xs">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div>
    <p className="text-xs text-on_surface_variant">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);

export default Inventory;
