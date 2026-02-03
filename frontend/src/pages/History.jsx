import React, { useState, useEffect } from "react";
import axios from "../axios";
import { Table, Button } from "antd";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";

const History = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`/api/transactions/getList`);
        const parsedTransactions = response.data
          .map((transaction) => ({
            id: transaction.id,
            amount: transaction.amount,
            type: transaction.type,
            status: transaction.status,
            description: transaction.description,
            date: new Date(transaction.timestamp).toLocaleString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          }))
          .reverse();
        setTransactions(parsedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Bank Statement", 14, 22);

    doc.setFontSize(12);
    doc.text(`Name: ${user.username}`, 14, 32);
    doc.text(`Email: ${user.email}`, 14, 40);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 48);

    const tableColumn = ["Date", "Amount", "Type", "Description", "Status"];
    const tableRows = transactions.map((transaction) => [
      transaction.date,
      transaction.amount,
      transaction.type,
      transaction.description,
      transaction.status,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: "grid",
    });

    doc.save("Bank_Statement.pdf");
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <span
          className={text === "SUCCESS" ? "text-green-600" : "text-red-600"}
        >
          {text}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold gradient-text-blue">Transaction History</h1>
        <Button
          onClick={downloadPDF}
          type="primary"
          className="bg-blue-500 hover:bg-blue-600"
        >
          Download PDF
        </Button>
      </div>
      <Table
        dataSource={transactions}
        columns={columns}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
        className="bg-white shadow-sm"
        rowClassName={(record) =>
          record.type === "CREDIT" ? "bg-green-50" : "bg-red-50"
        }
      />
    </div>
  );
};

export default History;
