import React, { useState } from 'react';
import { Button, Input, Modal, notification, Form } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form] = Form.useForm();
  const [mpin, setMpin] = useState(['', '', '', '', '', '']);
  const [confirmMpin, setConfirmMpin] = useState(['', '', '', '', '', '']);
  const [mpinModalVisible, setMpinModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [formData, setFormData] = useState(null); // To store form data temporarily
  const [isMpinMatch, setIsMpinMatch] = useState(true); // To track if MPINs match
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [mpinLoading, setMpinLoading] = useState(false); // Loading state for MPIN confirmation

  const navigate = useNavigate();

  const handleFormSubmit = (values) => {
    setFormData(values);
    setMpinModalVisible(true);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    validatePassword(value, confirmPassword);
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    validatePassword(password, value);
  };

  const validatePassword = (password, confirmPassword) => {
    setIsPasswordMatch(password === confirmPassword);
  };

  const handleMpinChange = (value, index, type) => {
    const newMpin = type === 'set' ? [...mpin] : [...confirmMpin];
    newMpin[index] = value.slice(-1);

    if (type === 'set') setMpin(newMpin);
    else setConfirmMpin(newMpin);

    if (value && index < 5) {
      const nextInput = document.getElementById(`${type}-mpin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleMpinSubmit = async () => {
    if (mpin.join('') === confirmMpin.join('')) {
      setIsMpinMatch(true);
      setMpinLoading(true); // Start MPIN confirmation loading

      try {
        const { username, password, email } = formData;
        const userData = { username, password, email, balance: 10000.0, mpin: mpin.join('') };

        await axios.post('/api/users/reg', userData);
        notification.success({ message: 'User registered successfully!' });
        navigate('/');
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Registration failed',
          description: error.response?.data || 'Something went wrong',
        });
      } finally {
        setMpinLoading(false); // End MPIN confirmation loading
      }

      setMpinModalVisible(false);
    } else {
      setIsMpinMatch(false);
      notification.error({ message: 'MPINs do not match' });
    }
  };

  return (
    <div className="flex justify-start items-center">
      <div className="w-full">
        <h2 className="text-2xl font-bold text-left text-gray-800 mb-6">Register to Digi Bank</h2>

        <Form
          form={form}
          onFinish={handleFormSubmit}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters long' },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                message: 'Password must contain a mix of letters, numbers, and special characters',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            rules={[
              { required: true, message: 'Please confirm your password' },
              {
                validator: () =>
                  isPasswordMatch ? Promise.resolve() : Promise.reject('Passwords do not match'),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
          </Form.Item>

          {!isPasswordMatch && (
            <p className="text-red-500 text-sm mt-2">Passwords do not match</p>
          )}

          <Button
            type="primary"
            htmlType="submit"
            className="w-full py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700"
            loading={loading} // Show spinner during form submission
            onClick={() => setLoading(true)} // Start loading on submit
          >
            Submit
          </Button>
        </Form>
      </div>

      {/* MPIN Modal */}
      <Modal
        title={<span className="text-xl font-bold text-blue-600">Set Up Your MPIN</span>}
        visible={mpinModalVisible}
        onCancel={() => setMpinModalVisible(false)}
        footer={null}
      >
        <div>
          <p className="text-sm mb-2">Enter your MPIN (6 digits) twice to confirm:</p>

          <div className="grid grid-cols-6 gap-2 mb-4">
            {mpin.map((digit, index) => (
              <Input
                key={index}
                id={`set-mpin-${index}`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleMpinChange(e.target.value, index, 'set')}
                className="w-full h-14 text-center text-2xl font-bold border-2 border-blue-500 focus:ring-2 focus:ring-blue-400 shadow-md"
              />
            ))}
          </div>

          <p className="text-sm mb-2">Confirm your MPIN:</p>
          <div className="grid grid-cols-6 gap-2">
            {confirmMpin.map((digit, index) => (
              <Input
                key={index}
                id={`confirm-mpin-${index}`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleMpinChange(e.target.value, index, 'confirm')}
                className="w-full h-14 text-center text-2xl font-bold border-2 border-blue-500 focus:ring-2 focus:ring-blue-400 shadow-md"
              />
            ))}
          </div>

          {!isMpinMatch && (
            <p className="text-red-500 text-sm mt-2">MPINs do not match</p>
          )}

          <Button
            type="primary"
            className="mt-6 w-full text-lg py-3"
            size="large"
            onClick={handleMpinSubmit}
            loading={mpinLoading} // Show spinner during MPIN confirmation
          >
            Confirm MPIN
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Register;
