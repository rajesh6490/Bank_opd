import {
  DollarOutlined,
  EyeOutlined,
  MailOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  notification,
  Row,
  Tag,
  Divider,
  Alert,
  Tooltip,
  message,
} from "antd";
import React, { useState } from "react";
import axios from "../axios";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth(); // User data from context
  const [showBalance, setShowBalance] = useState(false);
  const [mpin, setMpin] = useState(["", "", "", "", "", ""]);
  const [isMpinModalVisible, setIsMpinModalVisible] = useState(false);
  const [balance, setBalance] = useState(null); // To store the fetched balance

  // Error handling for user data
  if (!user) {
    return (
      <div className="mt-10 text-center">
        <h1 className="text-3xl font-semibold text-gray-700">
          User data not found. Please log in again.
        </h1>
      </div>
    );
  }

  const handleShowBalance = () => {
    setIsMpinModalVisible(true);
  };

  const handleMpinSubmit = async () => {
    if (mpin.join("") === user.mpin) {
      // Validate MPIN against stored one in user data
      try {
        const response = await axios.get(`/api/users/balance`);
        setBalance(response.data);
        setShowBalance(true);
        setIsMpinModalVisible(false);
        setMpin(["", "", "", "", "", ""]);
        notification.success({ message: "Balance fetched successfully!" });
      } catch (error) {
        notification.error({
          message: "Failed to fetch balance",
          description: error.message,
        });
      }
    } else {
      notification.error({ message: "Invalid MPIN" });
    }
  };

  const handleMpinChange = (value, index) => {
    const newMpin = [...mpin];
    newMpin[index] = value.slice(-1); // Allow only the last digit entered
    setMpin(newMpin);

    if (value && index < mpin.length - 1) {
      const nextInput = document.getElementById(`mpin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Function to copy the account number to clipboard
  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(user.accountNumber);
    message.success("Account number copied to clipboard!");
  };

  return (
    <>
      {/* Verification Banner */}
      {!user.verified ? (
        <Alert
          message="Account Not Verified"
          description="Please check your email to verify your account and complete the verification process. Please relogin after the verification process"
          type="warning"
          showIcon
          banner
          className="mb-6"
        />
      ) : (
        <Alert
          message="Account Verified"
          description="Your account has been verified, happy banking!"
          type="success"
          showIcon
          banner
          className="mb-6"
        />
      )}

      {/* User Profile and Account Information */}
      <Row gutter={16} className="mt-8" justify="center">
        <Col span={24} md={12}>
          <Card
            title="User Information"
            bordered={false}
            className="shadow-xl text-lg bg-blue-100 rounded-lg h-full"
            extra={
              user.verified ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Verified
                </Tag>
              ) : (
                <Tag color="red" icon={<CloseCircleOutlined />}>
                  Not Verified
                </Tag>
              )
            }
          >
            <p>
              <UserOutlined /> <strong>Username:</strong> {user.username}
            </p>
            <p>
              <MailOutlined /> <strong>Email:</strong> {user.email}
            </p>
            <p>
              <DollarOutlined /> <strong>Balance:</strong>{" "}
              {showBalance ? balance : "****"}
            </p>
            <Divider />
            <Button
              onClick={handleShowBalance}
              className="mt-4 w-full bg-gray-500 text-white hover:bg-gray-600 transition duration-300 ease-in-out"
              icon={<EyeOutlined />}
            >
              Check Balance
            </Button>
          </Card>
        </Col>

        <Col span={24} md={12}>
          <Card
            title="Account Details"
            bordered={false}
            className="shadow-xl text-lg bg-gray-100 rounded-lg h-full"
            extra={
              <Button
                icon={<CopyOutlined />}
                size="small"
                onClick={handleCopyAccountNumber}
              >
                Copy Account Number
              </Button>
            }
          >
            <Row gutter={16} className="mb-6">
              <Col span={24} md={24}>
                <div className="bg-white shadow-md p-6 rounded-lg">
                  <h3 className="text-xl font-semibold">
                    <IdcardOutlined /> Account Number: {user.accountNumber}
                  </h3>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24} md={24}>
                <div className="bg-white shadow-md p-6 rounded-lg">
                  <h3 className="text-xl font-semibold">
                    <UserOutlined /> Username: {user.username}
                  </h3>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Modal for MPIN */}
      <Modal
        title={
          <span className="text-xl font-bold text-blue-600">Enter MPIN</span>
        }
        open={isMpinModalVisible}
        onOk={handleMpinSubmit}
        onCancel={() => setIsMpinModalVisible(false)}
        okText="Submit"
        cancelText="Cancel"
        className="mpin-modal"
      >
        <div className="grid grid-cols-6 gap-2">
          {mpin.map((digit, index) => (
            <Input
              key={index}
              id={`mpin-${index}`}
              maxLength={1}
              value={digit}
              onChange={(e) => handleMpinChange(e.target.value, index)}
              className="w-full h-14 text-center text-2xl font-bold border-2 border-blue-500 focus:ring-2 focus:ring-blue-400 shadow-md"
            />
          ))}
        </div>
      </Modal>
    </>
  );
};

export default Home;
