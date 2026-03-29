import { useState } from "react";
import { useOkrs, type Objective } from "../hooks/useOkrs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_CONFIG = {
  active: { label: "Ativo", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  completed: {
    label: "Concluído",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
  },
  at_risk: {
    label: "Em Risco",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
  },
} as const;

function ProgressBar({ value }: { value: number }) {
  const color = value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div
      style={{
        width: "100%",
        height: 8,
        background: "#1e293b",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(value, 100)}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          borderRadius: 4,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

export default function OkrsPage() {
  const { data, loading, createOkr, updateKrProgress } = useOkrs();
  const [showForm, setShowForm] = useState(false);
  const [editingKr, setEditingKr] = useState<{
    objId: string;
    krId: string;
    val: number;
  } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [krs, setKrs] = useState([
    { title: "", target_val: "", unit: "%", weight: 1 },
  ]);

  const handleAddKr = () =>
    setKrs([...krs, { title: "", target_val: "", unit: "%", weight: 1 }]);
  const handleRemoveKr = (i: number) =>
    setKrs(krs.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!title || !targetDate || krs.some((kr) => !kr.title || !kr.target_val))
      return;
    await createOkr({
      title,
      description,
      target_date: targetDate,
      key_results: krs.map((kr) => ({
        ...kr,
        target_val: Number(kr.target_val),
      })) as any,
    });
    setTitle("");
    setDescription("");
    setTargetDate("");
    setKrs([{ title: "", target_val: "", unit: "%", weight: 1 }]);
    setShowForm(false);
  };

  const handleKrUpdate = async () => {
    if (!editingKr) return;
    await updateKrProgress(editingKr.objId, editingKr.krId, editingKr.val);
    setEditingKr(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <div style={{ color: "#94a3b8", fontSize: 18 }}>Carregando OKRs...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#f1f5f9",
              margin: 0,
            }}
          >
            OKRs — Objetivos & Key Results
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 4, fontSize: 14 }}>
            Defina objetivos estratégicos e acompanhe resultados-chave
            mensuráveis
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {showForm ? "✕ Cancelar" : "+ Novo Objetivo"}
        </button>
      </div>

      {/* Analytics Chart */}
      {!loading && data.length > 0 && (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              color: "#f1f5f9",
              marginTop: 0,
              marginBottom: 24,
              fontSize: 16,
            }}
          >
            Visão Geral de Progresso
          </h3>
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="title"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(val) =>
                    val.length > 15 ? val.substring(0, 15) + "..." : val
                  }
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    color: "#f1f5f9",
                    borderRadius: 8,
                  }}
                  formatter={(value: number) => [`${value}%`, "Progresso"]}
                />
                <Bar dataKey="progress" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h3 style={{ color: "#f1f5f9", marginTop: 0, marginBottom: 16 }}>
            Novo Objetivo
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            <input
              placeholder="Título do Objetivo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <h4 style={{ color: "#cbd5e1", margin: "20px 0 12px" }}>
            Key Results
          </h4>
          {krs.map((kr, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 80px 40px",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <input
                placeholder={`KR ${i + 1}`}
                value={kr.title}
                onChange={(e) => {
                  const n = [...krs];
                  n[i].title = e.target.value;
                  setKrs(n);
                }}
                style={inputStyle}
              />
              <input
                placeholder="Meta"
                value={kr.target_val}
                type="number"
                onChange={(e) => {
                  const n = [...krs];
                  n[i].target_val = e.target.value;
                  setKrs(n);
                }}
                style={inputStyle}
              />
              <input
                placeholder="Unidade"
                value={kr.unit}
                onChange={(e) => {
                  const n = [...krs];
                  n[i].unit = e.target.value;
                  setKrs(n);
                }}
                style={inputStyle}
              />
              <button
                onClick={() => handleRemoveKr(i)}
                style={{
                  background: "none",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={handleAddKr}
              style={{
                background: "none",
                border: "1px dashed #475569",
                color: "#94a3b8",
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              + Key Result
            </button>
            <button
              onClick={handleSubmit}
              style={{
                background: "#10b981",
                color: "#fff",
                border: "none",
                padding: "8px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Salvar Objetivo
            </button>
          </div>
        </div>
      )}

      {/* Objectives List */}
      {data.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "#64748b",
            background: "#0f172a",
            borderRadius: 12,
            border: "1px dashed #1e293b",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <p style={{ fontSize: 16 }}>Nenhum objetivo definido ainda.</p>
          <p style={{ fontSize: 13 }}>
            Clique em "Novo Objetivo" para começar a definir seus OKRs.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {data.map((obj: Objective) => {
            const status = STATUS_CONFIG[obj.status] || STATUS_CONFIG.active;
            return (
              <div
                key={obj.id}
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                {/* Objective Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <h3 style={{ color: "#f1f5f9", margin: 0, fontSize: 18 }}>
                        {obj.title}
                      </h3>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          color: status.color,
                          background: status.bg,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                    {obj.description && (
                      <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                        {obj.description}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#f1f5f9",
                      }}
                    >
                      {obj.progress}%
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Meta:{" "}
                      {new Date(obj.target_date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>

                <ProgressBar value={obj.progress} />

                {/* Key Results */}
                {obj.key_results && obj.key_results.length > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {obj.key_results.map((kr) => {
                      const krPercent = Math.min(
                        (kr.current_val / kr.target_val) * 100,
                        100,
                      );
                      return (
                        <div
                          key={kr.id}
                          style={{
                            background: "#1e293b",
                            borderRadius: 8,
                            padding: "12px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                color: "#e2e8f0",
                                fontSize: 13,
                                fontWeight: 500,
                                marginBottom: 4,
                              }}
                            >
                              {kr.title}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <ProgressBar value={krPercent} />
                              <span
                                style={{
                                  color: "#94a3b8",
                                  fontSize: 12,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {kr.current_val} / {kr.target_val} {kr.unit}
                              </span>
                            </div>
                          </div>
                          {editingKr?.krId === kr.id ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                                marginLeft: 12,
                              }}
                            >
                              <input
                                type="number"
                                value={editingKr.val}
                                onChange={(e) =>
                                  setEditingKr({
                                    ...editingKr,
                                    val: Number(e.target.value),
                                  })
                                }
                                style={{
                                  ...inputStyle,
                                  width: 80,
                                  padding: "4px 8px",
                                }}
                              />
                              <button
                                onClick={handleKrUpdate}
                                style={{
                                  background: "#10b981",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 4,
                                  padding: "4px 8px",
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setEditingKr({
                                  objId: obj.id,
                                  krId: kr.id,
                                  val: kr.current_val,
                                })
                              }
                              style={{
                                background: "none",
                                border: "1px solid #475569",
                                color: "#94a3b8",
                                borderRadius: 6,
                                padding: "4px 10px",
                                cursor: "pointer",
                                fontSize: 11,
                                marginLeft: 12,
                              }}
                            >
                              Atualizar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 6,
  padding: "8px 12px",
  color: "#e2e8f0",
  fontSize: 14,
  outline: "none",
};
