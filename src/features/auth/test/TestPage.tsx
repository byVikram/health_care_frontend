import { Box, Card, Grid, InputLabel, MenuItem, Select, Typography} from '@mui/material'
import { useEffect, useState } from 'react'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'


const TestPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [afterClick, setAfterClick] = useState("");
  const [color, setColor] = useState("");
  const [todoItems, setTodoItems] = useState<string[]>([]);
   useEffect(() => {
    if (color) {
      console.log("Selected color:", color);
    }
  }, [color]);


  // const handleSubmit = () => {
  //   console.log(color);
  //   setAfterClick(color); 
  // };

  const handleSubmit = () => {
    if (!inputValue) return;
    setTodoItems([...todoItems, inputValue]);
    setInputValue("");
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

      <Grid container direction="column" gap ={3}>

        <Card sx={{ padding: "60px", width: "600px", borderRadius: "12px" }}>
            {todoItems.map((item, index) => (
            <Typography key={index}> 
                 {item}</Typography>
            ))}
        </Card>

      <Card sx={{ padding: "60px", width: "600px", borderRadius: "12px" }}>
        <Grid container direction="column" gap={2}>
          <Grid size={4}>
            <AppInput
              label="To Do List"
              value={inputValue}
              placeholder="Enter the Work"
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
                <MenuItem value="white">White</MenuItem>
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
      </Grid>
    </Box>
  );
};

export default TestPage;
                                                
