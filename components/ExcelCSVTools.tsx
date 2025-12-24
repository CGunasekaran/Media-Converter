"use client";

import { useState, useRef } from "react";
import ExcelJS from "exceljs";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { downloadFile } from "@/lib/utils";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

type ConversionMode =
  | "csv-json"
  | "excel-csv"
  | "excel-json"
  | "excel-pdf"
  | "visualize";

export default function ExcelCSVTools() {
  const [mode, setMode] = useState<ConversionMode>("csv-json");
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<Record<string, unknown>[] | null>(
    null
  );
  const [csvData, setCsvData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<"pie" | "bar" | "line">("bar");
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setJsonData(null);
    setCsvData("");
    setChartData(null);
  };

  const convertCSVToJSON = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      // Parse CSV manually
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      const json: Record<string, unknown>[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",");
        const rowData: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index]?.trim() || "";
        });
        json.push(rowData);
      }

      setJsonData(json);
      setLoading(false);
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Failed to convert CSV to JSON");
      setLoading(false);
    }
  };

  const convertExcelToCSV = async () => {
    if (!file) {
      alert("Please select an Excel file");
      return;
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Convert to CSV manually
      let csvString = "";
      worksheet.eachRow((row) => {
        const values: string[] = [];
        row.eachCell((cell) => {
          values.push(String(cell.value || ""));
        });
        csvString += values.join(",") + "\n";
      });

      setCsvData(csvString);
      setLoading(false);
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Failed to convert Excel to CSV");
      setLoading(false);
    }
  };

  const convertExcelToJSON = async () => {
    if (!file) {
      alert("Please select an Excel file");
      return;
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const json: Record<string, unknown>[] = [];
      const headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          row.eachCell((cell) => {
            headers.push(String(cell.value));
          });
        } else {
          const rowData: Record<string, unknown> = {};
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber - 1]] = cell.value;
          });
          json.push(rowData);
        }
      });

      setJsonData(json);
      setLoading(false);
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Failed to convert Excel to JSON");
      setLoading(false);
    }
  };

  const convertExcelToPDF = async () => {
    if (!file) {
      alert("Please select an Excel file");
      return;
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Convert to HTML for better PDF rendering
      let html = '<table border="1" style="border-collapse: collapse;">';

      worksheet.eachRow((row) => {
        html += "<tr>";
        row.eachCell((cell) => {
          html += `<td style="padding: 5px;">${cell.value || ""}</td>`;
        });
        html += "</tr>";
      });

      html += "</table>";

      // Send to API route for PDF conversion
      const response = await fetch("/api/excel-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) throw new Error("PDF conversion failed");

      const blob = await response.blob();
      downloadFile(blob, file.name.replace(/\.(xlsx?|csv)$/i, ".pdf"));
      setLoading(false);
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Failed to convert Excel to PDF");
      setLoading(false);
    }
  };

  const visualizeData = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const data: Record<string, unknown>[] = [];
      let headers: string[] = [];

      if (file.name.endsWith(".csv")) {
        // Parse CSV manually
        const text = await file.text();
        const lines = text.split("\n");
        headers = lines[0].split(",").map((h) => h.trim());

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(",");
          const rowData: Record<string, unknown> = {};
          headers.forEach((header, index) => {
            const value = values[index]?.trim() || "";
            // Try to parse as number
            const numValue = Number(value);
            rowData[header] = isNaN(numValue) ? value : numValue;
          });
          data.push(rowData);
        }
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) {
            row.eachCell((cell) => {
              headers.push(String(cell.value));
            });
          } else {
            const rowData: Record<string, unknown> = {};
            row.eachCell((cell, colNumber) => {
              rowData[headers[colNumber - 1]] = cell.value;
            });
            data.push(rowData);
          }
        });
      }

      // Get first two columns for visualization
      const keys = headers;
      const labelKey = keys[0];
      const valueKey = keys[1];

      const labels = data.map((row: Record<string, unknown>) =>
        String(row[labelKey])
      );
      const values = data.map(
        (row: Record<string, unknown>) => Number(row[valueKey]) || 0
      );

      const colors = [
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 206, 86, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(255, 159, 64, 0.8)",
      ];

      setChartData({
        labels,
        datasets: [
          {
            label: valueKey,
            data: values,
            backgroundColor: colors,
            borderColor: colors.map((c) => c.replace("0.8", "1")),
            borderWidth: 2,
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error("Visualization error:", error);
      alert(
        "Failed to visualize data. Make sure your file has at least 2 columns."
      );
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!jsonData) return;
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    downloadFile(
      blob,
      file?.name.replace(/\.(csv|xlsx?)$/i, ".json") || "data.json"
    );
  };

  const downloadCSV = () => {
    if (!csvData) return;
    const blob = new Blob([csvData], { type: "text/csv" });
    downloadFile(blob, file?.name.replace(/\.xlsx?$/i, ".csv") || "data.csv");
  };

  const processFile = () => {
    switch (mode) {
      case "csv-json":
        convertCSVToJSON();
        break;
      case "excel-csv":
        convertExcelToCSV();
        break;
      case "excel-json":
        convertExcelToJSON();
        break;
      case "excel-pdf":
        convertExcelToPDF();
        break;
      case "visualize":
        visualizeData();
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>📊 Excel/CSV Tools:</strong> Convert between formats and
          visualize data with charts
        </p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setMode("csv-json")}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            mode === "csv-json"
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          CSV → JSON
        </button>
        <button
          onClick={() => setMode("excel-csv")}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            mode === "excel-csv"
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Excel → CSV
        </button>
        <button
          onClick={() => setMode("excel-json")}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            mode === "excel-json"
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Excel → JSON
        </button>
        <button
          onClick={() => setMode("excel-pdf")}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            mode === "excel-pdf"
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Excel → PDF
        </button>
        <button
          onClick={() => setMode("visualize")}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            mode === "visualize"
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          📈 Visualize
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">
            ⚙️ Conversion Settings
          </h3>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Select File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={
                mode === "csv-json"
                  ? ".csv"
                  : mode === "visualize"
                  ? ".csv,.xlsx,.xls"
                  : ".xlsx,.xls"
              }
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {file ? `📄 ${file.name}` : "📁 Choose File"}
            </button>
          </div>

          {mode === "visualize" && chartData && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Chart Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    chartType === "bar"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  📊 Bar
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    chartType === "line"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  📈 Line
                </button>
                <button
                  onClick={() => setChartType("pie")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    chartType === "pie"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🥧 Pie
                </button>
              </div>
            </div>
          )}

          {file && (
            <button
              onClick={processFile}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors font-medium disabled:opacity-50 shadow-lg"
            >
              {loading ? "⏳ Processing..." : "✨ Process File"}
            </button>
          )}
        </div>

        {/* Output */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">📤 Output</h3>

          {jsonData && (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                JSON Output ({jsonData.length} rows)
              </p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-96 text-gray-700 dark:text-gray-200">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
              <button
                onClick={downloadJSON}
                className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                💾 Download JSON
              </button>
            </div>
          )}

          {csvData && (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                CSV Output
              </p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-96 text-gray-700 dark:text-gray-200">
                {csvData}
              </pre>
              <button
                onClick={downloadCSV}
                className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                💾 Download CSV
              </button>
            </div>
          )}

          {chartData && (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Data Visualization
              </p>
              <div className="h-80">
                {chartType === "pie" && <Pie data={chartData} />}
                {chartType === "bar" && <Bar data={chartData} />}
                {chartType === "line" && <Line data={chartData} />}
              </div>
            </div>
          )}

          {!jsonData && !csvData && !chartData && (
            <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Output will appear here after processing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
