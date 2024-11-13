# Solidity API

## IRootsyErrors

Interface for error messages used in Rootsy contracts.

### IncorrectValue

```solidity
error IncorrectValue(string message)
```

Error when the parameter in functions is not correct.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| message | string | The error message. |

### IncorrectCondition

```solidity
error IncorrectCondition(string message)
```

Error when some condition for performing the function is not correct.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| message | string | The error message. |

### ActionPerformed

```solidity
error ActionPerformed(string message)
```

Error indicating that an action already performed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| message | string | The error message. |

### InterfaceNotSupported

```solidity
error InterfaceNotSupported()
```

Error indicating that the interface is not supported.

