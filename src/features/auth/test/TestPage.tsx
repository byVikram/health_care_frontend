import { Box, Card, Grid, InputLabel, MenuItem, Select } from '@mui/material'
import { useEffect, useState } from 'react'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'


const TestPage = () => {
  const [inputValue, setInputValue] = useState("white");
  const [afterClick, setAfterClick] = useState("");
  const [color, setColor] = useState("");

   useEffect(() => {
    if (color) {
      console.log("Selected color:", color);
    }
  }, [color]);


  const handleSubmit = () => {
    console.log(color);
    setAfterClick(color); 
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{ backgroundColor: afterClick }}
    >
      <Card sx={{ padding: "60px", width: "600px", borderRadius: "12px" }}>
        <Grid container direction="column" gap={2}>
          <Grid size={4}>
            <AppInput
              label="Full Name"
              value={inputValue}
              placeholder="Enter your full name"
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            />
        </Grid>

        <Grid>
              <InputLabel>Color</InputLabel>
              <Select
                value={color}
                label="Color"
                onChange={(e) => {
                  setColor(e.target.value)
                }}
              >
                <MenuItem value="red">Red</MenuItem>
                <MenuItem value="blue">Blue</MenuItem>
                <MenuItem value="green">Green</MenuItem>
              </Select>
        </Grid>

          <Grid size={12} display="flex" justifyContent="center">
            <AppButton 
                label="submit"
                variant="contained"
                onClick={handleSubmit}
            />
          </Grid>

        </Grid>

      </Card>
    </Box>
  );
};

export default TestPage;
                                                
