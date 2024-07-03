import {Tab, Tabs as MUITab, SxProps, Theme} from '@mui/material'

type Props<T> = {
  value: T,
  options: T[],
  onChange: (value: T) => void,
  sx?: SxProps<Theme>
  tabSx?: SxProps<Theme>
}

export function Tabs<Value extends string | null>({value, options, onChange, sx, tabSx}: Props<Value>) {
  return (
    <MUITab sx={sx} value={value}>
      {options.map((value) => <Tab key={value} sx={tabSx} onClick={() => onChange(value)} label={value} value={value}/>)}
    </MUITab>
  )
}