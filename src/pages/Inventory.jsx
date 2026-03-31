import { useEffect, useState } from "react";
import API from "../services/api";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);

  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    unit: "",
    category: "OTHERS",
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/inventory/");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();

    try {
      setAdding(true);

      await API.post("/inventory/", {
        ...newItem,
        quantity: parseFloat(newItem.quantity),
      });

      setShowForm(false);
      fetchInventory();

      setNewItem({
        item_name: "",
        quantity: "",
        unit: "",
        category: "OTHERS",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const adjustQuantity = async (id, current, change) => {
    await API.patch(`/inventory/${id}`, {
      quantity: current + change,
    });
    fetchInventory();
  };

  const updateExact = async (id, value) => {
    if (!value) return;

    await API.patch(`/inventory/${id}`, {
      quantity: parseFloat(value),
    });

    fetchInventory();
  };

  const filtered = items.filter((i) => {
    if (filter !== "ALL" && i.category !== filter) return false;
    if (search && !i.item_name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Inventory</h1>
          <p className="text-sm text-slate-500">Manage resources</p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white px-4 py-2 rounded"
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
            className={`px-3 py-1.5 text-xs rounded-full transition ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-slate-200 hover:bg-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search inventory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/3 border px-3 py-2 rounded-lg"
      />

      {/* 🔥 MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 animate-fade-in flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow space-y-4 animate-slide-in">
            <div className="flex justify-between">
              <h2 className="font-semibold text-lg">Add Item</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <input
                placeholder="Item"
                value={newItem.item_name}
                onChange={(e) =>
                  setNewItem({ ...newItem, item_name: e.target.value })
                }
                required
                className="border px-3 py-2 rounded w-full"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Qty"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: e.target.value })
                  }
                  required
                  className="border px-3 py-2 rounded"
                />

                <input
                  placeholder="Unit"
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unit: e.target.value })
                  }
                  required
                  className="border px-3 py-2 rounded"
                />
              </div>

              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
              >
                <option value="FOOD">Food</option>
                <option value="MEDICAL">Medical</option>
                <option value="WATER">Water</option>
                <option value="OTHERS">Others</option>
              </select>

              <button
                disabled={adding}
                className={`w-full py-2 rounded text-white flex items-center justify-center gap-2 ${
                  adding
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {adding && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {adding ? "Adding..." : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔥 TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center space-y-2">
            <div className="animate-pulse text-slate-400">
              Loading inventory...
            </div>
            <div className="h-1 bg-slate-200 rounded overflow-hidden">
              <div className="h-full bg-indigo-500 animate-progress"></div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No items found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Item</th>
                <th>Category</th>
                <th>Total</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => {
                const available = item.quantity - item.reserved_quantity;

                return (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-slate-50 transition animate-slide-in"
                  >
                    <td className="p-3 font-medium">{item.item_name}</td>

                    <td>
                      <span className="px-2 py-1 text-xs rounded-full bg-slate-100">
                        {item.category}
                      </span>
                    </td>

                    <td>
                      {item.quantity} {item.unit}
                    </td>

                    <td className="text-slate-500">{item.reserved_quantity}</td>

                    <td className="font-medium">{available}</td>

                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            adjustQuantity(item.id, item.quantity, -1)
                          }
                          className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 transition"
                        >
                          −
                        </button>

                        <input
                          type="number"
                          defaultValue={item.quantity}
                          onBlur={(e) => updateExact(item.id, e.target.value)}
                          className="w-16 text-center border rounded px-1 py-1"
                        />

                        <button
                          onClick={() =>
                            adjustQuantity(item.id, item.quantity, 1)
                          }
                          className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;
