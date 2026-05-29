// src/features/Pharmacy/components/OrdersScreen.tsx
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Grid, Stack, IconButton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { OrderCard } from '../../../components/common/Card/OrderCard';
import OrderList from '../OrderList';

import PendingIcon from '../../../assets/Pharmacy/Pendingorders.svg';
import OnTheWayIcon from '../../../assets/Pharmacy/Ontheway.svg';
import DeliveredIcon from '../../../assets/Pharmacy/Deliveredorders.svg';
import CancelledIcon from '../../../assets/Pharmacy/Cancelledorders.svg';
import DocIcon from '../../../assets/Pharmacy/docxs.svg';
import { customCardStyle } from '../../../styles/commonStyles';

interface StatItem {
  title: string;
  stats: string;
  imageSrc: string;
  iconBgColor: string;
}

const OrdersScreen: React.FC = () => {
  const [showList, setShowList] = useState(false);

  const statsData: StatItem[] = [
    { title: 'Pending orders',   stats: '03 Orders',  imageSrc: PendingIcon,   iconBgColor: '#FFF1D9' },
    { title: 'On the way',       stats: '08 Orders',  imageSrc: OnTheWayIcon,  iconBgColor: '#DEE9FF' },
    { title: 'Delivered orders', stats: '120 Orders', imageSrc: DeliveredIcon, iconBgColor: '#DFF5E4' },
    { title: 'Cancelled orders', stats: '21 Orders',  imageSrc: CancelledIcon, iconBgColor: '#FFE3E7' },
  ];

  if (showList) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, pt: 2 }}>
          <IconButton onClick={() => setShowList(false)} size="small">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight={600} color="#1A2C33">Orders</Typography>
        </Box>
        <OrderList />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: '#1A2C33' }}>Orders</Typography>

      <Paper elevation={0} sx={{ ...customCardStyle }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#eaf1ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={DocIcon} width={28} height={28} alt="docs" />
          </Box>
          <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
            Manage the orders shared by doctors/patients
          </Typography>
        </Stack>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => setShowList(true)}
          sx={{ color: '#2bbec7', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: 'transparent', opacity: 0.8 } }}
        >
          View
        </Button>
      </Paper>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {statsData.map((item, idx) => (
          <Grid size={{ xs: 12, sm: 6 }} key={idx}>
            <Box onClick={() => setShowList(true)} sx={{ cursor: 'pointer' }}>
              <OrderCard imageSrc={item.imageSrc} title={item.title} stats={item.stats} iconBgColor={item.iconBgColor} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OrdersScreen;