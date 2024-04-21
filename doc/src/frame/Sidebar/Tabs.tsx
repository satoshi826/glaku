import {Tab, Tabs as MUITab, styled} from '@mui/material'

type Props<T extends string> = {
  value: T,
  options: T[],
  onChange: (value: T) => void
}

export function Tabs<T extends string>({value, options, onChange}: Props<T>) {
  return (
    <MUITab value={value} sx={({palette}) => ({px: 1, py: 0, borderBottom: `1px solid ${palette.divider}`})}>
      {options.map((value) => <StyledTab key={value} onClick={() => onChange(value)} label={value} value={value}/>)}
    </MUITab>
  )
}

const StyledTab = styled(Tab)({
  flexGrow: 1,
  padding : 0,
  width   : 0
})
