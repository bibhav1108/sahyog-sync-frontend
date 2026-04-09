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

  const [deleteTarget, setDeleteTarget] = useState(null);
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

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: finalQuantity } : item,
      ),
    );

    try {
      await API.patch(`/inventory/${id}`, {
        quantity: finalQuantity,
      });
      fetchInventory(false);
    } catch {
      fetchInventory(false);
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
      setNewItem({
        item_name: "",
        quantity: "",
        unit: "kilogram",
        category: "OTHERS",
      });
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
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Units" value={total} />
        <StatCard label="Reserved" value={reserved} />
        <StatCard label="Available" value={total - reserved} highlight />
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Inventory</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-5 py-2 rounded-lg w-full sm:w-auto"
        >
          + Add Item
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search inventory..."
        className="w-full max-w-md px-4 py-3 rounded-lg bg-surface_high"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "FOOD", "MEDICAL", "WATER", "OTHERS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${
              filter === f ? "bg-primary text-white" : "bg-surface_high"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center p-10">Loading...</div>
      ) : (
        <div className="bg-surface_high rounded-xl overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-4 py-3 text-xs font-semibold text-on_surface_variant border-b border-black/10">
            <div>Name</div>
            <div>Category</div>
            <div>Total</div>
            <div>Reserved</div>
            <div>Available</div>
            <div className="text-right">Actions</div>
          </div>

          {filtered.map((i) => {
            const available = getAvailable(i);
            const low = available < i.quantity * 0.2;

            return (
              <div
                key={i.id}
                className="grid grid-cols-6 gap-4 px-4 py-3 items-center border-b border-black/5 hover:bg-black/5 transition"
              >
                <div className="font-semibold">
                  {i.item_name}
                  {low && <span className="ml-2 text-xs text-red-500">⚠</span>}
                </div>

                <div>
                  <span className="text-xs bg-surface px-2 py-1 rounded">
                    {i.category}
                  </span>
                </div>

                <div>{i.quantity}</div>
                <div>{i.reserved_quantity}</div>
                <div className={low ? "text-red-500 font-semibold" : ""}>
                  {available}
                </div>

                <div className="flex justify-end gap-2">
                  {editingId === i.id ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={editValue}
                        onChange={(e) => {
                          if (
                            Number(e.target.value) >= 0 ||
                            e.target.value === ""
                          ) {
                            setEditValue(e.target.value);
                          }
                        }}
                        className="w-20 px-2 py-1 rounded bg-surface text-sm border border-black/10"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(i.id, editValue)}
                        className="text-xs px-2 py-1 bg-primary text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs px-2 py-1 bg-surface rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(i.id);
                          setEditValue(i.quantity);
                        }}
                        className="p-1 hover:bg-primary/10 rounded"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteTarget({
                            id: i.id,
                            item_name: i.item_name,
                            reserved_quantity: i.reserved_quantity,
                          });
                          setDeleteError("");
                        }}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-sm text-on_surface_variant">
              No items found
            </div>
          )}
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
              className="absolute top-4 right-4"
            >
              ✕
            </button>

            <h2 className="font-bold text-lg">Add Item</h2>

            {formError && (
              <div className="text-red-500 text-sm font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddItem} className="space-y-3">
              <input
                placeholder="Item"
                value={newItem.item_name}
                className="w-full px-3 py-2 rounded bg-surface_high"
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
                  className="px-3 py-2 rounded bg-surface_high"
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: e.target.value })
                  }
                />

                <select
                  value={newItem.unit}
                  className="px-3 py-2 rounded bg-surface_high"
                  onChange={(e) =>
                    setNewItem({ ...newItem, unit: e.target.value })
                  }
                >
                  <option value="kilogram">kilogram</option>
                  <option value="pound">pound</option>
                  <option value="ounce">ounce</option>
                  <option value="ton">ton</option>
                </select>
              </div>

              <button className="w-full py-2 bg-primary text-white rounded">
                {adding ? "Adding..." : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-surface_lowest p-6 rounded-xl w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg text-center">
              Delete "{deleteTarget.item_name}"?
            </h2>

            {deleteError && (
              <div className="text-red-500 text-sm text-center">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 bg-surface_high rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-red-500 text-white rounded"
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
    className={`p-5 rounded-xl ${
      highlight ? "bg-primary text-white" : "bg-surface_high"
    }`}
  >
    <p className="text-xs">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Inventory;
