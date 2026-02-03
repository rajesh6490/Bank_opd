import React, { useState } from "react";
import { Input, Button, notification, Modal, Alert } from "antd";
import { useAuth } from "../context/AuthContext";
import {
  RiseOutlined,
  UserOutlined,
  DollarCircleOutlined,
  MailOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import axios from "../axios";
const Transaction = () => {
  const { user } = useAuth();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isRecipientValid, setIsRecipientValid] = useState(null);
  const [mpinModalVisible, setMpinModalVisible] = useState(false);
  const [mpin, setMpin] = useState(["", "", "", "", "", ""]);

  const handleRecipientCheck = async () => {
    if (recipient === user.accountNumber) {
      notification.info({
        message: "Recipient Invalid",
        description: `You can't use your own account number.`,
      });
      return;
    }
    try {
      const response = await axios.get(`/api/users/check/${recipient}`);
      if (response.data) {
        setIsRecipientValid(response.data);
        if (response.data.verified) {
          notification.success({
            message: "Recipient Valid",
            description: `The account number "${recipient}" is valid and verified.`,
          });
        } else {
          notification.warning({
            message: "Recipient Unverified",
            description: `The account number "${recipient}" is not verified. Transactions cannot proceed.`,
          });
        }
      } else {
        notification.error({
          message: "Recipient Not Found",
          description: `The account number "${recipient}" does not exist.`,
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "An error occurred while checking the recipient.",
      });
    }
  };

  const handleSendMoney = async () => {
    if (!isRecipientValid?.verified) {
      notification.error({
        message: "Transaction Blocked",
        description:
          "The recipient account is not verified. Transactions are not allowed.",
      });
      return;
    }

    if (mpin.join("") !== user.mpin) {
      notification.error({
        message: "Incorrect MPIN",
        description: "The MPIN entered is incorrect.",
      });
      return;
    }

    try {
      const data = {
        toAccount: recipient,
        amount: parseFloat(amount),
        mpin: mpin.join(""),
      };
      await axios.post("/api/transactions/transfer", data);
      notification.success({
        message: "Success",
        description: "Money sent successfully!",
      });
      setRecipient("");
      setAmount("");
      setMpin(["", "", "", "", "", ""]);
      setIsRecipientValid(false);
    } catch (error) {
      notification.error({
        message: "Transaction Failed",
        description: "An error occurred while processing the transaction.",
      });
    } finally {
      setMpinModalVisible(false);
    }
  };

  const handleMpinChange = (value, index) => {
    const newMpin = [...mpin];
    newMpin[index] = value.slice(-1);
    setMpin(newMpin);

    if (value && index < mpin.length - 1) {
      const nextInput = document.getElementById(`mpin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-4">
      {isRecipientValid && (
        <UserOutlined
          className={`text-${isRecipientValid.verified ? "green" : "red"
            }-600 text-6xl mb-6`}
        />
      )}

      <h1 className="text-4xl font-extrabold text-blue-600 mb-6">
        Transfer Funds <RiseOutlined />
      </h1>
      {!isRecipientValid && (
        <img
          src="/depo.gif"
          alt="payment_logo"
          className="w-1/3 mix-blend-multiply mb-6"
        />
      )}
      <Input
        className="mt-4 w-full max-w-lg border-blue-500 shadow-lg"
        placeholder="Recipient Account Number"
        prefix={<UserOutlined className="text-blue-500" />}
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        disabled={isRecipientValid}
      />
      {!isRecipientValid && (
        <Button
          type="primary"
          className="mt-4 w-full max-w-lg text-lg py-3"
          size="large"
          onClick={handleRecipientCheck}
        >
          Check Recipient
        </Button>
      )}
      {isRecipientValid && (
        <>
          {!isRecipientValid.verified && (
            <Alert
              className="mt-4 w-full max-w-lg"
              message="Recipient Not Verified"
              description="The recipient account is not verified. Transactions cannot proceed."
              type="warning"
              showIcon
              icon={<WarningOutlined />}
            />
          )}

          <Input
            className="mt-4 w-full max-w-lg border-blue-500 shadow-lg uppercase bg-green-50"
            placeholder="Name"
            type="text"
            prefix={<UserOutlined className="text-green-500" />}
            value={isRecipientValid.username}
            disabled
          />
          <Input
            className="mt-4 w-full max-w-lg border-blue-500 shadow-lg uppercase bg-green-50"
            placeholder="Email"
            type="email"
            prefix={<MailOutlined className="text-green-500" />}
            value={isRecipientValid.email}
            disabled
          />
          {isRecipientValid.verified && (
            <>
              <Input
                className="mt-4 w-full max-w-lg border-blue-500 shadow-lg"
                placeholder="Amount"
                type="number"
                prefix={<DollarCircleOutlined className="text-blue-500" />}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button
                type="primary"
                className="mt-4 w-full max-w-lg text-lg py-3"
                size="large"
                onClick={() => setMpinModalVisible(true)}
              >
                Pay
              </Button>
            </>
          )}
        </>
      )}
      <Modal
        title={
          <span className="text-xl font-bold text-blue-600">Enter MPIN</span>
        }
        visible={mpinModalVisible}
        onCancel={() => setMpinModalVisible(false)}
        footer={null}
      >
        <img
          src="/pay.gif"
          alt="logo"
          className="w-1/3 mb-2 mx-auto rounded-lg"
        />
        <div className="grid grid-cols-6 gap-2">
          {mpin.map((digit, index) => (
            <Input
              key={index}
              id={`mpin-${index}`}
              maxLength={1}
              value={digit}
              onChange={(e) => handleMpinChange(e.target.value, index)}
              className="w-full h-14 text-center text-2xl font-bold border border-blue-500 focus:ring-2 focus:ring-blue-400 shadow-md"
            />
          ))}
        </div>
        <Button
          type="primary"
          className="mt-6 w-full text-lg py-3"
          size="large"
          onClick={handleSendMoney}
        >
          Confirm Payment
        </Button>
      </Modal>
    </div>
  );
};

export default Transaction;
