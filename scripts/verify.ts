import hardhat from 'hardhat';
export async function verifyContract(
  address: string,
  constructorArguments: any
) {
  return hardhat.run('verify:verify', {
    address,
    constructorArguments,
  });
}
