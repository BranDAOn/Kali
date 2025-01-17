import React, { useState, useContext, useEffect } from 'react';
import Router, { useRouter } from "next/router";
import AppContext from '../../context/AppContext';
import {
  Input,
  Button,
  Text,
  Textarea,
  Stack,
  Select
} from "@chakra-ui/react";
import { extensions } from "../../utils/addresses";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NumInputField from "../elements/NumInputField";
import { alertMessage } from "../../utils/helpers";

export default function SetCrowdsale() {
  const value = useContext(AppContext);
  const { web3, loading, account, abi, address, chainId, balances } = value.state;
  const [startDate, setStartDate] = useState(new Date());

  const updateExtType = (e) => {
    let newValue = e.target.value;
    setExtType(newValue);
  };

  const submitProposal = async (event) => {
    event.preventDefault();
    value.setLoading(true);

    if(account===null) {
      alertMessage('connect');
    } else {
      try {
        let object = event.target;
        var array = [];
        for (let i = 0; i < object.length; i++) {
          array[object[i].name] = object[i].value;
        }

        var {
          description_,
          account_,
          proposalType_,
          purchaseToken_,
          purchaseMultiplier_,
          purchaseLimit_,
          saleEnds_
        } = array; // this must contain any inputs from custom forms

        saleEnds_ = new Date(saleEnds_).getTime() / 1000;

        const listId_ = 0;

        const amount_ = 0;

        purchaseLimit_ = web3.utils.toWei(purchaseLimit_);

        const payload_ = web3.eth.abi.encodeParameters(
          ['uint256', 'address', 'uint8', 'uint96', 'uint32'],
          [listId_, purchaseToken_, purchaseMultiplier_, purchaseLimit_, saleEnds_]
        );
        console.log(payload_)

        const instance = new web3.eth.Contract(abi, address);

        try {
          let result = await instance.methods
            .propose(proposalType_, description_, [account_], [amount_], [payload_])
            .send({ from: account });
            value.setReload(value.state.reload+1);
            value.setVisibleView(1);
        } catch (e) {
          alertMessage('send-transaction');
          value.setLoading(false);
          console.log(e);
        }
      } catch(e) {
        alertMessage('send-transaction');
        value.setLoading(false);
        console.log(e);
      }
    }

    value.setLoading(false);
  };

  return (
    <form onSubmit={submitProposal}>
    <Stack>
      <Text><b>Details</b></Text>
      <Textarea name="description_" size="lg" placeholder=". . ." />

      <Text>Purchase Token</Text>
      <Select
        name="purchaseToken_"
      >
        {balances.map((b, index) => (

          <option key={index} value={b['address']}>{b['token']} (balance: {b['balance']})</option>
        ))}
      </Select>
      <Text>Purchase Multiplier</Text>
      <NumInputField name="purchaseMultiplier_" min="1" max="255" />
      <Text>Purchase Limit</Text>
      <NumInputField name="purchaseLimit_" min=".000000000000000001" />
      <Text>Sale Ends</Text>
      <DatePicker name="saleEnds_" selected={startDate} onChange={(date) => setStartDate(date)} showTimeSelect />

      <Input type="hidden" name="proposalType_" value="8" />
      <Input type="hidden" name="account_" value={extensions[chainId]['crowdsale']} />

      <Button type="submit">Submit Proposal</Button>
    </Stack>
    </form>
  );
}
