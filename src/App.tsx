import { useEffect, useRef, useState } from 'react'
import './App.css'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Button } from '@mui/material';

type Data = {
  success: boolean
  data: {
    key: string
    name: string
    rate: number
    decimals: number
  }[]
}

type CacheData = {
  time: number
  data: Data
}

const App = () => {
  const [options, setOptions] = useState<Data["data"]>(() => {
    const cached = localStorage.getItem("currentPrice");
    if (cached) {
      const cachedData: CacheData = JSON.parse(cached);
      return cachedData.data?.data ?? [];
    }
    return [];
  });
  const [fromCurrency, setFromCurrency] = useState<Data["data"][number] | null>(null);
  const [toCurrency, setToCurrency] = useState<Data["data"][number] | null>(null);
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const resultRef = useRef<HTMLInputElement>(null);

  const formatNumber = (value: string) => {
    if (!value) return "";

    const [integer, decimal] = value.split(".");

    const formattedInteger = Number(integer).toLocaleString("en-US");

    return decimal !== undefined
      ? `${formattedInteger}.${decimal}`
      : formattedInteger;
  };
  
  useEffect(() => {
    const getPrice = async (showAlert: boolean) => {
      // getting new price value
      const response = await fetch(
        "https://tindex.app/api/public/currency-rates",
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            Accept: "application/json",
          },
        }
      );
      if (!response.ok) {
        // throw new Error(`API Error: ${response.status}`);
        alert("لطفا دقایقی دیگر مجدداً تلاش کنید")
      }
      const data: Data = await response.json();
      setOptions(data.data);
      

      // caching time of request and price value
      const cache: CacheData = {
        time: Date.now(),
        data: data
      }
      localStorage.setItem("currentPrice", JSON.stringify(cache))
      if (showAlert) { 
        alert("قیمت به روز شد")
      }
      // getting new price value after 5 minutes 
      timeout = setTimeout(() => getPrice(true), 5 * 60 * 1000)
    };

    let timeout: ReturnType<typeof setTimeout>

    // checking if there is a cached value or not
    if (localStorage.getItem("currentPrice")) {
      const cachedData: CacheData = JSON.parse(localStorage.getItem("currentPrice")!)
      // checking if has it been 5 minutes from last time(used when site is refreshed)
      if (Date.now() - cachedData.time < 5 * 60 * 1000) {
        const timeRemain = (5 * 60 * 1000) - (Date.now() - cachedData.time)
        // putting timeout for the remainig time of 5 minutes from last request
        timeout = setTimeout(() => getPrice(true), timeRemain)
      } else {
        // it has been more than 5 minutes
        getPrice(false)
      }
    } else { 
      // there is no cache
      getPrice(false)
    }
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className='flex justify-center items-center w-screen h-screen'>
      <main className="bg-[#FFFFFF] py-9 w-75 h-110 sm:h-auto rounded-2xl text-center border border-[#009688] shadow-[0_10px_30px_rgba(0,150,136,0.08)] sm:w-[90%] sm:max-w-180">
        <h1 className="m-0 mb-8 text-2xl">مبدل ارز</h1>
        <div className="flex flex-col w-fit gap-5 m-auto sm:flex-row sm:justify-center sm:gap-12 md:gap-15">
          <div className='w-55 sm:w-55 md:w-70'>
            <Autocomplete
              disablePortal
              options={options}
              value={fromCurrency}
              onChange={(_, newValue) => setFromCurrency(newValue)}
              getOptionLabel={(option) => option.name}
              size="small"
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "8px",
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
              renderInput={(params) => <TextField
                {...params}
                label="ارز مبدا"
              />}
            />
          </div>
          <div className='w-55 sm:w-55 md:w-70'>
            <Autocomplete
              disablePortal
              options={options}
              value={toCurrency}
              onChange={(_, newValue) => setToCurrency(newValue)}
              getOptionLabel={(option) => option.name}
              size="small"
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "8px",
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
              renderInput={(params) => <TextField
                {...params}
                label="ارز مقصد"
              />}
            />
          </div>
        </div>
        <div className="flex flex-col w-fit gap-6 mx-auto my-6">
          <div className='w-55'>
            <TextField
              label="مبلغ"
              type="text"
              slotProps={{
                htmlInput: {
                  inputMode: "decimal",
                },
              }}
              value={formatNumber(amount)}
              sx={{
                width: "220px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                },
              }}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");

                if (/^\d*\.?\d*$/.test(value)) {
                  setAmount(value);
                }
              }}
              size="small"
              />
          </div>
          <div> 
            <Button
              variant="contained"
              sx={{
                width: "100px",
                height: "45px",
                borderRadius: "8px",
              }}
              onClick={() => {
                if (!fromCurrency || !toCurrency || !amount) {
                  alert("همه فیلدها را پر کنید")
                  return
                }
                setResult(Number(amount) * fromCurrency!.rate / toCurrency!.rate)
                resultRef.current?.focus();
              }}
            >
              تبدیل
            </Button>
          </div>
        </div>
        <TextField
          label="نتیجه"
          inputRef={resultRef}
          onMouseDown={(e) => e.preventDefault()}
          defaultValue={result !== null ? result.toLocaleString("en-US") : ""}
          sx={{
            width: "220px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
            },
          }}
          slotProps={{
            input: {
              readOnly: true,
            },
            inputLabel: {
              shrink: Boolean(result),
            },
          }}
          size='small'
        />
      </main>
    </div>
  )
}

export default App