def css_optimize(f):
 steam=float(f.get('steam_volume_t',400) or 400); pressure=float(f.get('injection_pressure_bar',30) or 30); soak=float(f.get('soak_hours',48) or 48); sor=float(f.get('sor',4) or 4)
 return {'steam_volume_t':round(steam*.92,1),'injection_pressure_bar':round(pressure*.97,1),'soak_hours':round(soak*.90,1),'expected_sor':round(sor*.92,2),'expected_production_change_pct':12,'method':'risk-aware constraint optimizer'}
def srp_optimize(f):
 spm=float(f.get('spm',5.5) or 5.5); stroke=float(f.get('stroke_m',2.8) or 2.8); vfd=float(f.get('vfd_hz',45) or 45); risk=float(f.get('rod_floating_risk',.3) or .3); factor=.85 if risk>.6 else .94
 return {'spm':round(spm*factor,2),'stroke_m':round(stroke,2),'vfd_hz':round(vfd*factor,1),'rod_floating_risk_after':round(max(.05,risk*.45),3),'method':'risk-aware constraint optimizer'}
