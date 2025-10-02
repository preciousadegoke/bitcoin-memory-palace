import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can submit memory fragment",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('memory-palace', 'submit-fragment', [
                types.utf8("Just bought coffee with Bitcoin at Starbucks downtown!"),
                types.ascii("payment"),
                types.some(types.ascii("Downtown Seattle"))
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
        
        // Verify fragment was stored
        let fragment = chain.callReadOnlyFn('memory-palace', 'get-fragment', [types.uint(1)], deployer.address);
        let fragmentData = fragment.result.expectSome().expectTuple();
        
        assertEquals(fragmentData['content'], types.utf8("Just bought coffee with Bitcoin at Starbucks downtown!"));
        assertEquals(fragmentData['category'], types.ascii("payment"));
    },
});

Clarinet.test({
    name: "Can submit collective insight",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('memory-palace', 'submit-insight', [
                types.utf8("Coffee shops in downtown areas are increasingly accepting Bitcoin payments"),
                types.list([types.uint(1)])
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
    },
});