import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, Grid, Typography, CircularProgress, Box, Avatar, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Pagination
} from '@mui/material';
import {
    PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer
} from 'recharts';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import '../styles/admindashboard.css';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user.isAdmin) {
            navigate('/');
        }
    }, [navigate]);

    const refreshPageOnce = () => {
        const refreshed = localStorage.getItem('refreshed');
        if (!refreshed) {
            localStorage.setItem('refreshed', 'true');
            window.location.reload();
        }
    };

    useEffect(() => {
        refreshPageOnce();
    }, []);

    useEffect(() => {
        return () => {
            localStorage.removeItem('refreshed');
        };
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                let response = await fetch('http://localhost:5000/admindashboard', {
                    headers: {
                        authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                    }
                });

                const text = await response.text();

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const result = JSON.parse(text);
                setDashboardData(result);
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <Box className="dashboard-loading"><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography variant="h6" color="error" className="dashboard-error">Error: {error}</Typography>;
    }

    const { userCount, pendingProductCount, productCount, rejectedProductCount, users } = dashboardData;

    const pieData = [
        { name: 'Approved', value: productCount, color: '#4caf50' },
        { name: 'Pending', value: pendingProductCount, color: '#ff9800' },
        { name: 'Rejected', value: rejectedProductCount, color: '#f44336' },
    ];

    // Pagination logic
    const indexOfLastItem = page * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <div style={{ backgroundColor: "#f1f1f1" }}>
            <Box className="dashboard-container">
                <center><h1 style={{ color: "#434343" }}>Dashboard</h1></center>
                <div className="border"></div>
                <Grid container spacing={4}>

                    <Grid item xs={12} md={3}>
                        <Card className="dashboard-card">
                            <div className="dashboard-content">
                                <Avatar className="dashboard-avatar" style={{ backgroundColor: '#3f51b5' }}>
                                    <AccountCircleIcon />
                                </Avatar>
                                <div className="dashboard-text">
                                    <Typography variant="body1">Users</Typography>
                                    <Typography variant="h4">{userCount}</Typography>
                                    <LinearProgress variant="determinate" value={(userCount % 100)} className="dashboard-progress" />
                                </div>
                            </div>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card className="dashboard-card">
                            <div className="dashboard-content">
                                <Avatar className="dashboard-avatar" style={{ backgroundColor: '#4caf50' }}>
                                    <InventoryIcon />
                                </Avatar>
                                <div className="dashboard-text">
                                    <Typography variant="body1">Cars Listed</Typography>
                                    <Typography variant="h4">{productCount}</Typography>
                                    <LinearProgress variant="determinate" value={(productCount % 100)} className="dashboard-progress" />
                                </div>
                            </div>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card className="dashboard-card">
                            <div className="dashboard-content">
                                <Avatar className="dashboard-avatar" style={{ backgroundColor: '#ff9800' }}>
                                    <PendingIcon />
                                </Avatar>
                                <div className="dashboard-text">
                                    <Typography variant="body1">Pending Cars</Typography>
                                    <Typography variant="h4">{pendingProductCount}</Typography>
                                    <LinearProgress variant="determinate" value={(pendingProductCount % 100)} className="dashboard-progress" />
                                </div>
                            </div>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card className="dashboard-card">
                            <div className="dashboard-content">
                                <Avatar className="dashboard-avatar" style={{ backgroundColor: '#f44336' }}>
                                    <CancelIcon />
                                </Avatar>
                                <div className="dashboard-text">
                                    <Typography variant="body1">Rejected Cars</Typography>
                                    <Typography variant="h4">{rejectedProductCount}</Typography>
                                    <LinearProgress variant="determinate" value={(rejectedProductCount % 100)} className="dashboard-progress" />
                                </div>
                            </div>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Card className="dashboard-list-card shadow-sm">
                            <Typography variant="h6" align="center" gutterBottom>
                                User List
                            </Typography>
                            <TableContainer component={Paper} className="table-responsive">
                                <Table className="table table-hover table-striped">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" className="fw-bold">Name</TableCell>
                                            <TableCell align="center" className="fw-bold">Email</TableCell>
                                            <TableCell align="center" className="fw-bold">Account Created</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentUsers.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell align="center">{user.name}</TableCell>
                                                <TableCell align="center">{user.email}</TableCell>
                                                <TableCell align="center">{user.createdAt}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Pagination
                                count={Math.ceil(users.length / itemsPerPage)}
                                page={page}
                                onChange={handlePageChange}
                                variant="outlined"
                                shape="rounded"
                                className="mt-3 d-flex justify-content-center"
                            />
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card className="dashboard-chart-card">
                            <Typography variant="h6" align="center">Car Distribution</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label
                                        labelLine={false}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Grid>

                </Grid>
            </Box>
        </div>
    );
};

export default AdminDashboard;
