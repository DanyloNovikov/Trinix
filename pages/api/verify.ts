import { v4 as uuidv4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";
import { withSession, contractAddress, addressCheckMiddleware, pinataApiKey, pinataApiSecret } from "./utils";
import { NftMeta } from "@_types/nft";
import axios from "axios";

export default withSession(async (req: NextApiRequest, res: NextApiResponse) =>  {
    if (req.method === "POST") {
        try {
            const { body } = req;
            const nft = body.nft as NftMeta;

            if (!nft.name || !nft.description || !nft.attributes) {
                res.status(422).send("Not all form data are include"); 
            }

            await addressCheckMiddleware(req, res);

            const jsonResponse = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                pinataMetadata: {
                    name: uuidv4()
                },
                pinataContent: nft
            }, {
                headers: {
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataApiSecret
                }
            });

            res.status(200).send(jsonResponse.data);
        } catch {
            res.status(422).send({message: "Cannot generate a message!"});
        }
    } else if (req.method === "GET") {
        try {
            const message = { contractAddress, id: uuidv4() };
            req.session.user = { "message-session": message };
            await req.session.save();
      
            return res.json(message);
        } catch {
            res.status(422).send({message: "Cannot generate a message!"});
        }
    } else {
        res.status(404).json({message: "Invalid api route" });
    };
});