import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Badge,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import {
  AccountBalance,
  Person,
  BarChart,
  Settings,
  Add,
  TrendingUp,
  TrendingDown,
  Edit,
  CalendarMonth,
  Payments,
  ReceiptLong,
  EmojiEvents,
  EventNote,
  InsertChart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LimitsSetupDialog from '../components/LimitsSetupDialog';
import SpendingProgress from '../components/SpendingProgress';
import axios from 'axios';

function Dashboard() {
  const { user, isFirstLogin } = useAuth();
  const [openLimitsDialog, setOpenLimitsDialog] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const navigate = useNavigate();

  // Fetch transactions when component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/transactions');
        setTransactions(response.data || []);
        
        // Calculate points (simplified for now)
        calculatePoints(response.data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to load transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const calculatePoints = (txns) => {
    // Simple points calculation based on number of transactions and staying within limits
    let points = 0;
    
    // Base points for using the app
    points += 50;
    
    // Points for each transaction
    points += txns.length * 5;
    
    // Additional logic for limits-based points will be added in the Weekly/Monthly summaries
    setPointsEarned(points);
  };

  // Get total account balance (placeholder for now)
  const getAccountBalance = () => {
    return user?.income ? user.income * 0.7 : 0; // Just a placeholder value
  };

  // Get next income date (placeholder)
  const getNextIncomeDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get next estimated expense (placeholder)
  const getNextExpense = () => {
    if (!user?.limits || user.limits.length === 0) return 0;
    
    // Sum up 20% of each category limit as an estimate
    return user.limits.reduce((sum, limit) => sum + (limit[1] * 0.2), 0);
  };

  const accountBalance = getAccountBalance();
  const nextIncomeDate = getNextIncomeDate();
  const nextExpense = getNextExpense();

  const handleLimitsDialogClose = () => {
    setOpenLimitsDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Render the main dashboard content
  const renderDashboardContent = () => (
    <>
      <Grid container spacing={3}>
        {/* Account Balance */}
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AccountBalance />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Account Balance</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
                    ₹{accountBalance.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<Edit />}
                onClick={() => setOpenLimitsDialog(true)}
              >
                Update Income
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Transactions Section */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>Transactions</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                      <Payments />
                    </Avatar>
                    <Typography variant="subtitle1">Next Income</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Typography variant="h5">₹{user?.income ? user.income.toFixed(0) : '0'}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarMonth fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{nextIncomeDate}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.light', mr: 2 }}>
                      <ReceiptLong />
                    </Avatar>
                    <Typography variant="subtitle1">Next Expense</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Typography variant="h5">₹{nextExpense.toFixed(0)}</Typography>
                    <Typography variant="body2" color="text.secondary">Estimated</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Summary Section */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2, 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => navigate('/monthly-summary')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                      <InsertChart />
                    </Avatar>
                    <Typography variant="subtitle1">Monthly Summary</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    View your monthly spending patterns, category breakdown, and earn points for staying within your budget.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2, 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => navigate('/weekly-summary')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}>
                      <EventNote />
                    </Avatar>
                    <Typography variant="subtitle1">Weekly Summary</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Track your weekly spending habits, category performance, and get personalized tips to improve your finances.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Spending Progress</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : user?.limits && user.limits.length > 0 ? (
              <Box>
                <SpendingProgress limits={user.limits} transactions={transactions} />
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={() => setOpenLimitsDialog(true)}
                    startIcon={<Settings />}
                  >
                    Adjust Limits
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" paragraph>
                  No spending limits set up yet. Set up your limits to track your progress.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Add />}
                  onClick={() => setOpenLimitsDialog(true)}
                >
                  Set Up Limits
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  // Render the setup tab content
  const renderSetupContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>Income and Spending Limits Setup</Typography>
          <Typography variant="body1" paragraph>
            Configure your monthly income and spending limits to help track your financial progress.
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<Settings />}
              onClick={() => setOpenLimitsDialog(true)}
              sx={{ mb: 2, minWidth: 250 }}
            >
              {user?.income && user?.limits?.length > 0 ? 'Update Income & Limits' : 'Setup Income & Limits'}
            </Button>
            
            {user?.income && user?.limits?.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Your income and spending limits are already configured. You can update them anytime.
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Dashboard</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            badgeContent={pointsEarned} 
            color="secondary"
            max={9999}
            sx={{ 
              '& .MuiBadge-badge': { 
                fontSize: '0.8rem', 
                fontWeight: 'bold', 
                padding: '0 8px' 
              } 
            }}
          >
            <Tooltip title="Your reward points">
              <EmojiEvents color="action" sx={{ fontSize: 28, color: 'gold', mr: 2 }} />
            </Tooltip>
          </Badge>
          
          <Tooltip title="Account settings">
            <IconButton 
              size="large" 
              onClick={() => navigate('/profile')}
              sx={{ bgcolor: 'background.paper', ml: 1 }}
            >
              <Person />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Dashboard" />
          <Tab label="Setup" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 ? renderDashboardContent() : renderSetupContent()}

      {/* Limits Setup Dialog */}
      <LimitsSetupDialog 
        open={openLimitsDialog} 
        onClose={handleLimitsDialogClose}
        isFirstTimeSetup={false} // Never treat as first-time setup
      />
    </Box>
  );
}

export default Dashboard; 