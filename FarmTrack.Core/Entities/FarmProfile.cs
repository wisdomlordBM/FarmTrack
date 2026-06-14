using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FarmTrack.Core.Entities
{
    public class FarmProfile : BaseEntity
    {
        public string FarmName { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string? Phone { get; set; }

        public string? Email { get; set; }

        public string? Address { get; set; }

        public string? LogoUrl { get; set; }
    }
}