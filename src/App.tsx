import React, { useMemo } from "react";
import "./App.scss";
import assets from "@iov/asset-directory";
import {
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material";
import { Account, StarnameQueryClient } from "@iov/query-starnames";

function App() {
  const client = useMemo(() => {
    return new StarnameQueryClient("https://api.iov-mainnet-ibc.iov.one");
  }, []);
  const [loading, setLoading] = React.useState(false);
  const [proxyAddress, setProxyAddress] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [accounts, setAccounts] = React.useState<ReadonlyArray<Account>>([]);
  const [selectedSymbol, setSelectedSymbol] = React.useState("IOV");

  React.useEffect(() => {
    if (address === "") {
      setAccounts([]);
      return;
    }
    setLoading(true);
    client
      .getResourceAccounts(`asset:${selectedSymbol.toLowerCase()}`, address)
      .then(setAccounts)
      .catch((err) => {
        setAccounts([]);
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [address, client, selectedSymbol]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (proxyAddress === "") {
        setAddress("");
        return;
      }
      setAddress(proxyAddress);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [proxyAddress]);

  const starnames = accounts.map((acc) => `${acc.name}*${acc.domain}`);

  const handleProxyAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setProxyAddress(event.target.value);
  };

  return (
    <div className="App">
      <div className="search-container">
        <div className="address-container">
          <Select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
          >
            {assets.map((asset) => (
              <MenuItem value={asset.symbol} key={asset["starname-uri"]}>
                <div style={{ display: "flex" }}>
                  <img
                    src={asset.logo}
                    width={20}
                    height={20}
                    alt={asset.symbol}
                  />
                  <Typography style={{ marginLeft: 8 }}>
                    {asset.name}
                  </Typography>
                </div>
              </MenuItem>
            ))}
          </Select>
          <OutlinedInput
            fullWidth
            startAdornment={<InputAdornment position="start"></InputAdornment>}
            value={proxyAddress}
            onChange={handleProxyAddressChange}
            placeholder={`Enter ${selectedSymbol.toLowerCase()} address here`}
            style={{ marginLeft: 6 }}
          />
        </div>
        {loading && (
          <div className="loading-container">
            <LinearProgress />
          </div>
        )}
      </div>
      {starnames.length > 0 ? (
        <div className="starnames-container">
          <List sx={{ overflow: "auto", maxHeight: 280, width: "100%" }}>
            {starnames
              .sort((a, b) => a.localeCompare(b))
              .map((starname) => (
                <ListItem style={{ textAlign: "center" }}>
                  <ListItemText primary={starname} />
                </ListItem>
              ))}
          </List>
        </div>
      ) : address ? (
        <div className="not-found-container">
          <Typography variant={"h6"} color="GrayText" textAlign="center">
            No starnames associated to this address
          </Typography>
        </div>
      ) : null}
    </div>
  );
}

export default App;
