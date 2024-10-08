// components/Footer.js

import React from 'react'
import { Box, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { BLUE, GRAY } from '@/theme/palette'

const Footer = () => {
  const router = useRouter()
  const isHomePage = router.pathname === '/'

  return (
    <Box
      sx={{
        backgroundColor: isHomePage ? GRAY['homePage'] : BLUE.main,
        color: isHomePage ? 'black' : 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        width: '100%',
        zIndex: 2,
        position: 'relative',
      }}
    >
      <Image
        src={isHomePage ? '/edtech-footer-black.png' : '/edtech-footer-white.png'}
        alt="EdTech Assistant"
        width={120 * 0.8}
        height={89 * 0.8}
      />
      <Box
        sx={{
          textAlign: 'center',
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: 'bold', color: isHomePage ? 'black' : 'white' }}
        >
          Mark my words
        </Typography>
        <Typography variant="body2" sx={{ color: isHomePage ? 'black' : 'white' }}>
          ©2024 All Rights Reserved
        </Typography>
      </Box>
    </Box>
  )
}

export default Footer
